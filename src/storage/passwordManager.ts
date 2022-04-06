import { Key, Numeric } from '@proton/js'
import { CliUx } from '@oclif/core'
import { config } from './config'
import { encryptor } from './encryptor'

class PasswordManager {
    password: string = ""
    
    async getPassword() {
        while (!this.password) {
            const enteredPassword = await CliUx.ux.prompt('Please enter your 32-character password', { type: 'mask' })
            this.password = enteredPassword;
        }
    }

    async getPrivateKeys (): Promise<string[]> {
        let privateKeys = config.get('privateKeys')
        if (!privateKeys.length) {
            return []
        }

        // If locked
        if (config.get('isLocked')) {
            await this.getPassword()
            privateKeys = privateKeys.map(privateKey => encryptor.decrypt(this.password, privateKey))
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
            await this.getPassword()
            privateKeyStr = encryptor.encrypt(this.password, privateKeyStr)
        }

        // Validate password
        const privateKeys: string[] = await this.getPrivateKeys()
        if (privateKeys.find(privateKey => privateKey === privateKeyStr)) {
          throw new Error('\nPrivate key already exists')
        }

        // Set new 
        config.set("privateKeys", privateKeys.concat(privateKeyStr))
    
        // Log out
        CliUx.ux.log(`Successfully added new private key for public key: ${privateKeyStr}`)
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