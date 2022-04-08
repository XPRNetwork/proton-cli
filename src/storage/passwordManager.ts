import { Key, Numeric } from '@proton/js'
import { CliUx } from '@oclif/core'
import { config } from './config'
import { encryptor } from './encryptor'
import { green } from 'colors'

class PasswordManager {
    password: string = ""
   
    async lock (password?: string) {
        // Check if already locked
        if (config.get('isLocked')) {
            throw new Error('Wallet is already locked')
        }

        // Use passed or existing
        const passwordToLockWith = password || this.password

        // Encrypt and save existing keys
        const privateKeys = config.get('privateKeys').map(key => encryptor.encrypt(passwordToLockWith, key))
        config.set('privateKeys', privateKeys)

        // Update config
        config.set('isLocked', true)
    }
    
    async unlock (password?: string) {
        // Check if already unlocked
        if (!config.get('isLocked')) {
            throw new Error('Wallet is already unlocked')
        }
    
        // Use passed or existing
        const passwordToUnlockWith = password || this.password

        // Decrypt and save existing keys
        const privateKeys = config.get('privateKeys').map(key => encryptor.decrypt(passwordToUnlockWith, key))
        config.set('privateKeys', privateKeys)

        // Update local
        this.password = passwordToUnlockWith

        // Update config
        config.set('isLocked', false)
    }

    async getPassword() {
        while (!this.password) {
            const enteredPassword = await CliUx.ux.prompt('Please enter your 32 character password', { type: 'hide' })
            this.password = enteredPassword;
        }
        return this.password
    }

    async getPrivateKey (publicKey: string): Promise<string | undefined> {
        const privateKeys = await this.getPrivateKeys()
        const privateKey = privateKeys.find(_ => _ === Key.PublicKey.fromString(publicKey).toString())
        return privateKey
    }

    async getPrivateKeys (): Promise<string[]> {
        let privateKeys = config.get('privateKeys')
        if (!privateKeys.length) {
            return []
        }

        // If locked
        if (config.get('isLocked')) {
            const password = await this.getPassword()
            privateKeys = privateKeys.map(privateKey => encryptor.decrypt(password, privateKey))
        }

        return privateKeys
    }
    
    async addPrivateKey (privateKeyStr?: string) {
        // Validate key
        let privateKey: Key.PrivateKey
        if (privateKeyStr) {
            privateKey = Key.PrivateKey.fromString(privateKeyStr)
        } else {
            privateKey = Key.generateKeyPair(Numeric.KeyType.k1, {secureEnv: true}).privateKey
        }

        // Encrypt if locked
        privateKeyStr = privateKey.toString()
        if (config.get('isLocked')) {
            const password = await this.getPassword()
            privateKeyStr = encryptor.encrypt(password, privateKeyStr)
        }

        // Validate password
        const privateKeys: string[] = await this.getPrivateKeys()
        if (privateKeys.find(privateKey => privateKey === privateKeyStr)) {
          throw new Error('\nPrivate key already exists')
        }

        // Set new 
        config.set("privateKeys", privateKeys.concat(privateKeyStr))
    
        // Log out
        CliUx.ux.log(`${green('Success:')} Added new private key for public key: ${privateKey.getPublicKey().toString()}`)
    }
    
    async removePrivateKey (privateKey: string) {
        const privateKeys: string[] = await this.getPrivateKeys()
        if (!privateKeys.find(_privateKey => _privateKey === privateKey)) {
            throw new Error('\nPrivate key does not exist')
        }
  
        if (privateKeys && privateKeys.length > 0) {
            config.set('privateKeys', privateKeys.filter((key: string) => key !== privateKey));
        } else {
            CliUx.ux.error(`You are not allowed to delete your last key`)
        }
    }
}

const passwordManager = new PasswordManager()

export default passwordManager