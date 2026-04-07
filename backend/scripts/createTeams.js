require('dotenv').config(); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');

const Team = require('../models/Team');

const teamNames = require('./teamNames.json');

function genPassword(length = 16) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
}

async function setTeams() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Bağlantı kuruldu");
        
        console.log("Eski takımlar ve veriler temizleniyor"); 
        await Team.deleteMany({}); 

        let generatedCredentials = []; 
        for (let name of teamNames){
            const plainPassword = genPassword(); 
            const hashedPassword = await bcrypt.hash(plainPassword,10); 
            const botApiKey = crypto.randomBytes(8).toString('hex'); 

            await Team.create({
                teamName : name,
                password : hashedPassword,
                botApiKey : botApiKey
            });

            generatedCredentials.push({
                teamName : name,
                password : plainPassword,
                botApiKey : botApiKey
            });
            
            console.log(`${name} eklendi`);
        }

        if (generatedCredentials.length > 0){
            fs.writeFileSync('./credentials.json', JSON.stringify(generatedCredentials,null,4));
            console.log("Kayıt tamamlandı"); 
        }
    }
    catch(err){
        console.log("Hata: ", err); 
    }
    finally{
        mongoose.connection.close();
        process.exit(); 
    }
}

setTeams();