export interface Manifest {
    encrypted: boolean,
    first_run: boolean,
    entries: Entry[],
    periodic_checking: boolean,
    periodic_checking_interval: number,
    periodic_checking_checkall: boolean,
    auto_confirm_market_transactions: boolean,
    auto_confirm_trades: boolean
}

export interface Entry {
    encryption_iv: string,
    encryption_salt: string,
    filename: string,
    steamid: number
}

export interface maFile {
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
    Session: Session
}

export interface Session {
    SessionID: string,
    SteamLogin: string,
    SteamLoginSecure: string,
    WebCookie: string,
    OAuthToken: string,
    SteamID: number
}

export interface Options {
    /**
     * The password that was used for encrypting the SDA.
     * If this option is `undefined` and the maFiles are indeed encrypted, then the user will be prompted via STDIN.
     */
    password?: string,
    /**
     * This allows you to directly specify where the targeted maFile is located.
     * If this option is `undefined` then it is assumed that the maFile is located in the same folder as the `manifest.json`
     * and that it's name is `steamid64.maFile` - where `steamid64` is already specified.
     */
    maFilePath?: string
}
