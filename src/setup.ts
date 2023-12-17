import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { config } from "dotenv";
import { env } from "process";

config()

const rest = new REST().setToken(env['TOKEN']);

const sicCommand = new SlashCommandBuilder()
        .setName('sic')
        .setDescription('Woofs out the perpetrator.')
        .addUserOption(option =>
                option
                        .setName('bad_dog')
                        .setDescription('The bad dog to be woofed in to oblivion.')
                        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

const unsicCommand = new SlashCommandBuilder()
        .setName('unsic')
        .setDescription('Eases off of an improved pupper.')
        .addUserOption(option =>
                option
                        .setName('good_pupper')
                        .setDescription('The pupper that has made amends.')
                        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

const settleCommand = new SlashCommandBuilder()
        .setName('settle')
        .setDescription('Clears the bad pupper list.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

const petCommand = new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Might prove your worth.')

const commands = [
        sicCommand.toJSON(),
        unsicCommand.toJSON(),
        settleCommand.toJSON(),
        petCommand.toJSON()
]

await rest.put(Routes.applicationCommands(env['CLIENT_ID']), { body: commands })

console.log('Commands refreshed!');