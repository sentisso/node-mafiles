import crypto from "crypto"
import path from 'path'
import {promises as fs} from "fs";
import {readPromise} from "./utils";
import {Manifest, maFile, Options} from "./types/sda";
import {Entry} from "./types/sda";

/*
 * Based on https://github.com/Jessecar96/SteamDesktopAuthenticator/blob/8a408f13ee24f70fffbc409cb0e050e924f4fe94/Steam%20Desktop%20Authenticator/FileEncryptor.cs#L20
 */
const PBKDF2_ITERATIONS = 50000; //Set to 50k to make program not unbearably slow. May increase in future.
const SALT_LENGTH = 8;
const KEY_SIZE_BYTES = 32;
const IV_LENGTH = 16;


/**
 * Based on https://github.com/Jessecar96/SteamDesktopAuthenticator/blob/8a408f13ee24f70fffbc409cb0e050e924f4fe94/Steam%20Desktop%20Authenticator/FileEncryptor.cs#L62
 */
function getEncryptionKey(password: string, salt: string): Promise<Buffer> {
    return new Promise(resolve => {
        crypto.pbkdf2(password, Buffer.from(salt, 'base64'), PBKDF2_ITERATIONS, KEY_SIZE_BYTES, 'sha1', ((err, derivedKey) => {
            resolve(derivedKey)
        }))
    })
}


/**
 * Based on https://github.com/Jessecar96/SteamDesktopAuthenticator/blob/8a408f13ee24f70fffbc409cb0e050e924f4fe94/Steam%20Desktop%20Authenticator/FileEncryptor.cs#L87
 *
 * @param password The encryption password.
 * @param encryptionSalt `encryption_salt` from manifest.json
 * @param encryptionIv `encryption_iv` from manifest.json
 * @param encryptedData Content of the encrypted .maFile
 */
async function decryptData(password: string, encryptionSalt: string, encryptionIv: string, encryptedData: string) {
    const key = await getEncryptionKey(password, encryptionSalt)

    const decrypter = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(encryptionIv, 'base64'));

    return decrypter.update(encryptedData, "base64", "utf8") +  decrypter.final("utf8");
}


/**
 * Attempts to read and parse a specified maFile. Supports decryption of the maFiles.
 * If the maFile is encrypted and the password option isn't set, then the user will be prompted for the encryption password
 * via STDIN.
 *
 * @param manifestPath Path to the SDA manifest.json file containing more information about the maFiles.
 * @param steamid64 steamid64 of the steam account that we want the maFile of.
 * @param options All optional.
 * @param options.password The password that was used for encrypting the SDA. Define this for an instant decryption.
 * @param options.maFilePath This allows you to directly specify where the targeted maFile is located.
 * @returns Either the JSON parsed maFile in case of a success or `null` in case of an error.
 * @example
 * const maFile = await mafiles("./SDA/manifest.json", 76561197960287930, {
 *     password: "3ncrypt10n_Passw0rd",
 *     maFilePath: "./SDA/maFiles/account.maFile"
 * })
 */
export default async function mafiles(manifestPath: string, steamid64: number, options: Options|null = null): Promise<maFile | null> {
    const manifest: Manifest = require(manifestPath)

    const entry = manifest.entries.find((entry: Entry) => entry.steamid === steamid64)
    if (entry == null) throw new Error(`Entry with the specified steamid64 ${steamid64} was not found in ${manifest}`)

    const maFilePath = (options && options.maFilePath && options.maFilePath.length > 0) ? options.maFilePath : path.dirname(manifestPath) + `/${entry.filename}`

    const maFile = await fs.readFile(maFilePath)

    if (manifest.encrypted) {
        let password = null

        if (options && options.password) password = options.password
        else {
            let result = await readPromise({prompt: 'Enter SDA encryption password:', silent: true})
            password = result.result
        }

        if (password == null || password.length <= 0 || typeof password !== "string") throw new Error("The encryption password was not specified or is not of type string or has a length of 0")

        return JSON.parse(await decryptData(password, entry.encryption_salt, entry.encryption_iv, maFile.toString()))

    } else {
        return JSON.parse(maFile.toString())
    }

    return null
}
