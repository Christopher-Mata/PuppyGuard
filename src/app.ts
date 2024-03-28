import { Client, GatewayIntentBits, GuildMember } from "discord.js";
import { env } from "process";
import "./setup.js";
import { connect } from "mongoose";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration] });

await connect(process.env['MONGO_URL'] + process.env['DB_NAME'])

type GuildMemberMap = {
    [guildID: string]: { id: string, barkcount: number }[]
}

const maxBarks = 3

const badDogList: GuildMemberMap = {}

const barkList = [
    "Woof!",
    "Woof! Woof! Woof!",
    "Grrrr!",
    "Grrrr! Woof woof woof!!!",
    "Ruff! Ruff ruff ruff howwoooooo! Grrr!",
    "Shhhhh Woof!",
]

client.once('ready', () => {
    console.log(`logged in as:\t${client.user.tag}`);
})

client.on('messageCreate', async message => {    

    if (!badDogList[message.guild.id]) badDogList[message.guild.id] = []

    if (message.mentions.users.has(client.user.id) || message.mentions.repliedUser === client.user) {
        if (badDogList[message.guild.id].filter(user => user.id === message.author.id).length < 1) {
            badDogList[message.guild.id].push({ id: message.author.id, barkcount: 0 })
        }
    }

    if (badDogList[message.guild.id].filter(user => message.author.id === user.id).length === 1) {
        const badDogIndex = badDogList[message.guild.id].map(user => user.id).indexOf(message.author.id)
        badDogList[message.guild.id][badDogIndex].barkcount++
        const barkcount = badDogList[message.guild.id][badDogIndex].barkcount
        console.log(`${message.author.id} is a bad dog.\tUserID:${badDogList[message.guild.id][badDogIndex].id}\tBarkCount:${badDogList[message.guild.id][badDogIndex].barkcount}`);


        const replyText = `# **${barkList[Math.floor(Math.random() * barkList.length)]}**\n\n` +
        `This is your ${barkcount}/${maxBarks * (Math.floor((barkcount - 1) / maxBarks) + 1)} strike. ${barkcount % maxBarks === 0 ? 'Goodbye for now!' : ''}`
        message.reply(replyText)

        if (barkcount % maxBarks === 0) {
            try {
                await message.member.timeout(60_000)
            } catch (e) {
                console.error('Did not have permissions, likely a higher role than the bot.');
                console.error(e.rawError);
            }
        }
    }
})

client.on('interactionCreate', async interaction => {
    console.log("\n\n\n---------interaction received-------\n");

    if (!badDogList[interaction.guild.id]) badDogList[interaction.guild.id] = []

    if (!interaction.isChatInputCommand()) return

    let pup = interaction.options.getUser('bad_dog') || interaction.options.getUser('good_pupper')

    switch (interaction.commandName) {
        case `sic`:
            if (pup.id !== client.user.id) {
                console.log(`the Bad Dog ${pup.displayName}:${pup.id} is being sicced`);

                if (badDogList[interaction.guild.id].filter(user => user.id === pup.id).length < 1) {
                    badDogList[interaction.guild.id].push({ id: pup.id, barkcount: 0 })
                }

                interaction.reply({ content: `User ${pup} is being sicced now!`, ephemeral: true })
            } else {
                console.log('Cannot sic self!');

                interaction.reply({ content: `Chasing my own tail! Woof woof woof woof woof! :p`, ephemeral: true })
            }
            break
        case `unsic`:
            if (badDogList[interaction.guild.id].filter(user => user.id === pup.id).length === 1) {
                console.log(`the Good Dog ${pup.displayName}:${pup.id} is being unsicced`);

                badDogList[interaction.guild.id].splice(badDogList[interaction.guild.id].map(user => user.id).indexOf(pup.id), 1)

                interaction.reply({ content: `The improved pupper ${pup}, has been given a break`, ephemeral: true })
            } else {
                console.log(`Pup ${pup.displayName}:${pup.id} not found in list.`)

                interaction.reply({ content: `Pupper ${pup} was not in trouble in the first place!`, ephemeral: true })
            }
            break
        case `settle`:
            console.log(`Settling down.`);

            badDogList[interaction.guild.id].splice(0, badDogList[interaction.guild.id].length)

            interaction.reply({ content: `${client.user} has settled down.`, ephemeral: true })

            break
        case 'pet':
            console.log(`Appreciating the pet.`);

            if (badDogList[interaction.guild.id].filter(user => user.id === interaction.user.id).length === 1) {
                console.log(`Deciding ${interaction.user.displayName}'s fate`)

                Math.floor(Math.random() * 100) > 72 ? (() => {
                    interaction.reply('# Wags Tail \n This shall do.')
                    badDogList[interaction.guild.id].splice(badDogList[interaction.guild.id].map(user => user.id).indexOf(interaction.user.id), 1)
                    console.log(`${interaction.user.displayName} was let off the hook`)
                })() : (async () => {
                    const badDogIndex = badDogList[interaction.guild.id].map(user => user.id).indexOf(interaction.user.id)
                    badDogList[interaction.guild.id][badDogIndex].barkcount++
                    const barkcount = badDogList[interaction.guild.id][badDogIndex].barkcount
                    console.log(`${interaction.user.id} is a bad dog.\tUserID:${badDogList[interaction.guild.id][badDogIndex].id}\tBarkCount:${badDogList[interaction.guild.id][badDogIndex].barkcount}`);


                    const replyText = `# **${barkList[Math.floor(Math.random() * barkList.length)]}**\n\n` +
                    `*Womp Womp*, /Pet was not effective. This is your ${barkcount}/${maxBarks * (Math.floor((barkcount - 1) / maxBarks) + 1)} strike. ${barkcount % maxBarks === 0 ? 'Goodbye for now!' : ''}`
                    interaction.reply(replyText)

                    if (barkcount % maxBarks === 0) {
                        try {
                            await (interaction.member as GuildMember).timeout(60_000)
                        } catch (e) {
                            console.error('Did not have permissions, likely a higher role than the bot.');
                            console.error(e.rawError);
                        }
                    }
                })()
            } else {
                interaction.reply('# Wags Tail')
            }
        default:
            break
    }
})

client.login(env['TOKEN'])
