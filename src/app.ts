import { Client, GatewayIntentBits } from "discord.js";
import { env } from "process";
import "./setup.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration] });

type GuildMemberMap = {
    [guildID: string]: {id: string, barkcount: number}[]
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

client.on('guildAvailable', guild => {
    badDogList[guild.id] = []
})

client.on('messageCreate', async message => {    
    if (badDogList[message.guild.id].filter(user => message.author.id === user.id).length === 1) {
        const badDogIndex = badDogList[message.guild.id].map(user => user.id).indexOf(message.author.id)
        badDogList[message.guild.id][badDogIndex].barkcount++
        const barkcount = badDogList[message.guild.id][badDogIndex].barkcount
        console.log(`${message.author.id} is a bad dog.\tUserID:${badDogList[message.guild.id][badDogIndex].id}\tBarkCount:${badDogList[message.guild.id][badDogIndex].barkcount}`);
        


        const replyText = `# **${barkList[Math.floor(Math.random() * barkList.length)]}**
        
This is your ${barkcount}/${maxBarks * (Math.floor((barkcount - 1) / maxBarks) + 1)} strike. ${barkcount % maxBarks === 0 ? 'Goodbye for now!': ''}
        `
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

    if (!interaction.isChatInputCommand()) return

    let pup = interaction.options.getUser('bad_dog') || interaction.options.getUser('good_pupper')

    switch (interaction.commandName) {
        case `sic`:
            if (pup.id !== client.user.id) {
                console.log(`the Bad Dog ${pup.displayName}:${pup.id} is being sicced`);

                if(badDogList[interaction.guild.id].filter(user => user.id === pup.id).length < 1){ 
                    badDogList[interaction.guild.id].push({id: pup.id, barkcount: 0})
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
        default:
            break
    }
})

client.login(env['TOKEN'])
