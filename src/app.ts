import { Client, REST, Routes, GatewayIntentBits, UserSelectMenuInteraction, User, AutocompleteInteraction } from "discord.js";
import "./setup.js";
import { env } from "process";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

const badDogList: String[] = []

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
    if (badDogList.includes(message.author.id)){
            message.reply(barkList[Math.floor(Math.random() * barkList.length)])
    }
})

client.on('interactionCreate', async interaction => {
    console.log("\n\n\n---------interaction received-------\n");

    if (!interaction.isChatInputCommand()) return
    
    let pup =  interaction.options.getUser('bad_dog') || interaction.options.getUser('good_pupper')

    switch (interaction.commandName) {
        case `sic`:
            if (pup.id !== client.user.id) {
                console.log(`the Bad Dog ${pup.displayName}:${pup.id} is being sicced`);
        
                badDogList.push(pup.id)
                
                interaction.reply({content: `User ${pup} is being sicced now!`, ephemeral: true})
            } else {
                console.log('Cannot sic self!');
                
                interaction.reply({content: `Chasing my own tail! Woof woof woof woof woof! :p`, ephemeral: true})
            }
            break
        case `unsic`:
            if (badDogList.includes(pup.id)) {
                console.log(`the Good Dog ${pup.displayName}:${pup.id} is being unsicced`);
                
                badDogList.splice(badDogList.indexOf(pup.id), 1)

                interaction.reply({content: `The improved pupper ${pup}, has been given a break`, ephemeral: true})
            } else {
                console.log(`Pup ${pup.displayName}:${pup.id} not found in list.`)

                interaction.reply({content: `Pupper ${pup} was not in trouble in the first place!`, ephemeral: true})
            }
            break
        case `settle`:
            console.log(`Settling down.`);

            badDogList.splice(0, badDogList.length)

            interaction.reply({content: `${client.user} has settled down.`, ephemeral: true})
            
            break
        default:
            break
    }

    
        
    
        
    
    
})

client.login(env['TOKEN'])
