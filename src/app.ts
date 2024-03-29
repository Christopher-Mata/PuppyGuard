import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { env } from "process";
import { connect } from "mongoose";
import GuildModel from "./model/guild.js";
import { config } from "dotenv";

config()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration] });

await connect(process.env['MONGO_URL'] + process.env['DB_NAME'])

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

client.on(Events.MessageCreate, async message => {   
    
    const guildModel = await GuildModel.findOne({guildID: message.guildId})
    const badDog = guildModel.badDogs.find(user => user.userID === message.author.id)

    if (message.mentions.users.has(client.user.id) || message.mentions.repliedUser === client.user) {
        if (!badDog && !message.member.roles.cache.get(guildModel.noBarkRole)) {
            await guildModel.updateOne({'$push': { badDogs: { userID: message.author.id, barkCount: 0 }}})
        }
    }

    if (badDog) {
        const barkCount = badDog.barkCount + 1
        await GuildModel.updateOne({ _id: guildModel._id, 'badDogs.userID': badDog.userID }, { '$set': { 'badDogs.$.barkCount': barkCount} })
        console.log(`${message.author.id} is a bad dog.\tUserID:${badDog.userID}\tBarkCount:${barkCount}`);


        const replyText = `# **${barkList[Math.floor(Math.random() * barkList.length)]}**\n\n` +
        `This is your ${(barkCount % guildModel.maxBarks) || 3}/${guildModel.maxBarks} strike. ` + 
        `${barkCount % guildModel.maxBarks === 0 ? `Goodbye for now! Timeout #${Math.floor(barkCount / guildModel.maxBarks)}` : ''}`
        message.reply(replyText)

        if (barkCount % guildModel.maxBarks === 0) {
            try {
                await message.member.timeout(60_000)
            } catch (e) {
                console.error('Did not have permissions, likely a higher role than the bot.');
                console.error(e.rawError);
            }
        }
    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const guildModel = await GuildModel.findOne({guildID: interaction.guildId})

    const pup = interaction.options.getUser('bad_dog') || interaction.options.getUser('good_pupper') || interaction.user
    const badDog = guildModel.badDogs.find(user => user.userID === pup.id)

    switch (interaction.commandName) {
        case `sic`:
            if (pup.id !== client.user.id) {
                console.log(`the Bad Dog ${pup.displayName}:${pup.id} is being sicced`);

                const badDogMember = interaction.options.getMember('bad_dog') as GuildMember

                if (!badDog && !badDogMember.roles.cache.get(guildModel.noBarkRole)) {
                    await guildModel.updateOne({'$push': { badDogs: { userID: pup.id, barkCount: 0 }}})
                    interaction.reply({ content: `User ${pup} is being sicced now!`, ephemeral: true })
                } else if (badDogMember.roles.cache.get(guildModel.noBarkRole)) {
                    interaction.reply({ content: `User ${pup} is not allowed to be sicced!`, ephemeral: true })
                } else {
                    interaction.reply({ content: `User ${pup} was already being sicced!`, ephemeral: true })
                }
                
            } else {
                console.log('Cannot sic self!');

                interaction.reply({ content: `Chasing my own tail! Woof woof woof woof woof! :p`, ephemeral: true })
            }
            break
        case `unsic`:
            if (badDog) {
                console.log(`the Good Dog ${pup.displayName}:${pup.id} is being unsicced`);

                await guildModel.updateOne({'$pull': { badDogs: { userID: pup.id }}})

                interaction.reply({ content: `The improved pupper ${pup}, has been given a break`, ephemeral: true })
            } else {
                console.log(`Pup ${pup.displayName}:${pup.id} not found in list.`)

                interaction.reply({ content: `Pupper ${pup} was not in trouble in the first place!`, ephemeral: true })
            }
            break
        case `settle`:
            console.log(`Settling down.`);

            await guildModel.updateOne({'$set': { 'badDogs': [] }})

            interaction.reply({ content: `${client.user} has settled down.`, ephemeral: true })

            break
        case 'pet': {
            console.log(`Appreciating the pet.`);

            if (badDog) {
                console.log(`Deciding ${interaction.user.displayName}'s fate`)

                if (Math.floor(Math.random() * 100) > 72) {
                    await guildModel.updateOne({'$pull': { badDogs: { userID: pup.id }}})
                    console.log(`${interaction.user.displayName} was let off the hook`)
                    interaction.reply('# Wags Tail \n This shall do.')
                } else {
                    const barkCount = badDog.barkCount + 1
                    await GuildModel.updateOne({ _id: guildModel._id, 'badDogs.userID': badDog.userID }, { '$set': { 'badDogs.$.barkCount': barkCount } })
                    console.log(`${pup.id} is a bad dog.\tUserID:${badDog.userID}\tBarkCount:${barkCount}`);

                    const replyText = `# **${barkList[Math.floor(Math.random() * barkList.length)]}**\n\n` +
                        `*Womp Womp*, /Pet was not effective. This is your ${(barkCount % guildModel.maxBarks) || 3}/${guildModel.maxBarks} strike. ` + 
                        `${barkCount % guildModel.maxBarks === 0 ? `Goodbye for now! Timeout #${Math.floor(barkCount / guildModel.maxBarks)}` : ''}`
                    interaction.reply(replyText)

                    if (barkCount % guildModel.maxBarks === 0) {
                        try {
                            await interaction.guild.members.cache.get(interaction.user.id).timeout(60_000)
                        } catch (e) {
                            console.error('Did not have permissions, likely a higher role than the bot.');
                            console.error(e.rawError);
                        }
                    }
                }
            } else {
                interaction.reply('# Wags Tail')
            }
            break
        }
        case 'config': {
            const reset = interaction.options.getBoolean('reset') || false
            const maxBarks = interaction.options.getInteger('max_barks') || (reset ? 3 : guildModel.maxBarks)
            const noBarkRole = interaction.options.getRole('no_bark_role')?.id || (reset ? '' : guildModel.noBarkRole)

            await guildModel.updateOne({maxBarks, noBarkRole})

            interaction.reply({content: `Comand Configured.\nMax Barks:\t${maxBarks}\nNo Bark Role:\t${interaction.guild.roles.cache.get(noBarkRole)?.toString() || 'None'}`, ephemeral: true})
            break
        }
        default:
            break
    }
})

client.on(Events.GuildAvailable, async guild => {
    await GuildModel.findOneAndUpdate({guildID: guild.id}, {'$setOnInsert': {}}, {upsert: true})
    
    console.log(`Available: ${guild.name}`);
})

client.on(Events.GuildCreate, async guild => {
    await GuildModel.findOneAndUpdate({guildID: guild.id}, {'$setOnInsert': {}}, {upsert: true})

    console.log(`Joined: ${guild.name}`);
})

client.on(Events.GuildDelete, async guild => {
    await GuildModel.deleteOne({guildID: guild.id})
})

client.login(env['TOKEN'])
