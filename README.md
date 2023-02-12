# node-mafiles
[![npm version](https://img.shields.io/npm/v/mafiles.svg)](https://npmjs.com/package/mafiles)
[![npm downloads](https://img.shields.io/npm/dm/mafiles.svg)](https://npmjs.com/package/mafiles)

This package provides an easy interface for parsing `maFiles` generated by the [Steam Desktop Authenticator](https://github.com/Jessecar96/SteamDesktopAuthenticator) (a.k.a. SDA, author: Jessecar96). SDA allows you to manage your steam account from your computer just as you would from your mobile phone _(2FA code generation, confirming trades etc.)_

`maFile` is a special file generated by the SDA, which stores necessary data about a steam account, that allow you to control your steam account fully automatically _(such as confirming steam trades automatically without the need of manual confirmation in the SDA app or a passwordless login etc.)_

This package also supports **in-memory decryption** of the `maFile` files _(if they were encrypted using the SDA app)_, so now you can save your actual `maFile` files encrypted on your disk for more safety, but still be able to read them by your NodeJS program; _by entering the encryption password in the STDIN or passing the password right away in the code._

# Usage

```ts
import mafiles from 'mafiles';

// this will load the maFile data of the account "76561197960287930" (located at "./SDA/76561197960287930.maFile")
const maFileGaben = await mafiles("./SDA/manifest.json", "76561197960287930", {
    password: "3ncrypt10n_Passw0rd" // please use a git untracked config file or something, instead of passing the password like this
})

if (maFileGaben != null) console.log(maFileGaben.shared_secret) // 'shared_secret of the account'
```
or as a `.then()` callback, where the steamid64 is passed as a BigInt
```ts
// if the file is encrypted, the user will be prompted in the console to enter the password (on each execution of this function)
mafiles("./SDA/manifest.json", 76561197960287930n, {
    maFilePath: "./SDA/maFiles/account.maFile"
}).then(maFileGaben => {
    
  if (maFileGaben != null) console.log(maFileGaben.shared_secret) // 'shared_secret of the account'
  
})
```

# Parameters and options
`mafiles(manifestPath, steamid64, options)`
- `manifestPath: string` Path to the SDA `manifest.json` file containing metadata about the maFiles.
  - _this file is needed for example for locating the account's `maFile` or for determining if the `maFile` is encrypted or not_
- `steamid64: string | BigInt` steamid64 of the steam account that we want the maFile of (only as a string or a native BigInt).
- `options: object` These are optional.
  - `password: string` The password that was used for encryption in SDA. Define this for an instant decryption. If the maFile is encrypted and this is not defined, then the user will be prompted for the password via STDIN in the console.
  - `maFilePath: string` This allows you to directly specify where the targeted `maFile` is located. If this option is not defined then it is assumed that the associated `maFile` is located in the same folder as `manifestPath` and that its name is `steamid64.maFile`.

### Return value
If the parsing _(and decryption)_ of the specified `maFile` were successful, then the function will return a parsed JSON object that will have the same structure as a regular decrypted `maFile`:
```ts
{
    shared_secret: string,
    serial_number: string,
    revocation_code: string,
    uri: string,
    server_time: number,
    account_name: string,
    token_gid: string,
    identity_secret: string,
    secret_1: string,
    status: number,
    device_id: string,
    fully_enrolled: boolean,
    Session: {
        SessionID: string,
        SteamLogin: string,
        SteamLoginSecure: string,
        WebCookie: string,
        OAuthToken: string,
        SteamID: BigInt
    }
}
```
If something went wrong, then an error will be thrown _(so don't forget to catch it)_. Otherwise the function will return `null`. Most common error scenarios:
1. the specified `manifest.json` file wasn't found
2. the `maFile` of the specified account wasn't found
3. the given steamid64 is a regular number (`76561197960287930`), it has to be a string (`"76561197960287930"`) or a native BigInt (`76561197960287930n`)
4. incorrect decryption password was given
5. the files are corrupted and couldn't be parsed, invalid JSON etc.

# Contribution
Feel free to create a pull request!
