import { Model, Schema, Types, model } from "mongoose"


interface IGuildBadDog {
    userID: string,
    barkCount: number
}

interface IGuild {
    guildID: string,
    maxBarks: number,
    badDogs: Types.Array<IGuildBadDog>
}

const GuildBadDogSchema = new Schema<IGuildBadDog, Model<IGuildBadDog>>({
    userID: {type: String, required: true},
    barkCount: {type: Number, required: true}
})

const GuildSchema = new Schema<IGuild, Model<IGuild>> ({
    guildID: {type: String, required: true, unique: true},
    maxBarks: {type: Number, required: true, default: 3},
    badDogs: [GuildBadDogSchema]
})

const GuildModel = model<IGuild>('Guild', GuildSchema)

export default GuildModel