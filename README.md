# node-mafiles
[![npm version](https://img.shields.io/npm/v/mafiles.svg)](https://npmjs.com/package/mafiles)
[![npm downloads](https://img.shields.io/npm/dm/mafiles.svg)](https://npmjs.com/package/mafiles)

This package provides an easy interface for parsing `maFiles` generated by the [Steam Desktop Authenticator](https://github.com/Jessecar96/SteamDesktopAuthenticator) (a.k.a. SDA, author: Jessecar96). SDA allows you to manage your your steam account from your computer just as you would from your mobile phone (2FA code generation, confirming trades etc.)

`maFile` is a special file generated by the SDA that stores necessary data about a steam account that allow you to control your steam account fully automatically (such as confirming steam trades automatically without the need of manual confirmation in the SDA app or a passwordless login etc.)

This package also supports decryption of the `maFiles` _(if they were encrypted via the SDA app)_, so now you can save your actual `maFiles` encrypted for more safety, but still be able to read them by your Node.js program; by entering the encryption password in the STDIN or passing the password right away in the code.

# Usage

```ts
import mafiles from 'mafiles';

const maFile = await mafiles("./SDA/manifest.json", "76561197960287930", {
    password: "3ncrypt10n_Passw0rd",
    maFilePath: "./SDA/maFiles/account.maFile"
})

if (maFile != null) console.log(maFile.shared_secret) // 'shared_secret of the account'
```
or as a `.then()` callback, where the steamid64 is passed as a BigInt
```ts
// here if the file is encrypted, the user will be prompted to enter the password
mafiles("./SDA/manifest.json", 76561197960287930n, {
    maFilePath: "./SDA/maFiles/account.maFile"
}).then(maFile => {
    
  if (maFile != null) console.log(maFile.shared_secret) // 'shared_secret of the account'
  
})
```

# Parameters and options
`mafiles(manifestPath, steamid64, options)`
- `manifestPath: string` Path to the SDA manifest.json file containing more information about the maFiles.
- `steamid64: string | BigInt` steamid64 of the steam account that we want the maFile of (only as a string or a native BigInt).
- `options: object` These are optional.
  - `password: string` The password that was used for encrypting the SDA. Define this for an instant decryption. If the maFile is encrypted and this is not defined, then the user will be prompted for the password via STDIN
  - `maFilePath: string` This allows you to directly specify where the targeted maFile is located. If this option is not defined then it is assumed that the maFile is located in the same folder as the specified `manifest.json` and that it's name is `steamid64.maFile` - where `steamid64` is also already specified.

### Return value
If the parsing (and decryption) of the specified `maFile` were successful, then the function will return a parsed JSON object that will have the same structure as a regular decrypted `maFile` that SDA saves:
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
3. the given steamid64 is a number, has to be a string or a native BigInt
4. incorrect decryption password was given
5. the files are corrupted, invalid JSON etc.

# Contribution
Feel free to create a pull request!
