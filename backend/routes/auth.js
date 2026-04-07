require('dotenv').config(); 
const express = require('express');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const Team = require('../models/Team'); 

const router = express.Router(); 
router.use(express.json());

router.get('/',(req,res) => {
    res.send("Selam"); 
}); 

router.post('/login', async(req,res) => {
    const {teamName, password} = req.body;
    try{
        const team = await Team.findOne({teamName}); 
        if (!team) return res.status(404).json({message : 'Hatalı takım adı ya da şifre'}); 
        
        const isMatch = await bcrypt.compare(password,team.password); 
        if (!isMatch) return res.status(404).json({message: 'Hatalı takım adı ya da şifre'});
        
        const token = jwt.sign({id : team._id, teamName: teamName}, process.env.JWT_SECRET, {expiresIn : '1d' }); 
        res.cookie('token', token,{
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'lax',
            maxAge : 24 * 60 * 60 * 1000
        });
        
        res.json({
            token,
            team: {
                id: team._id,
                teamName: team.teamName,
                botApiKey: team.botApiKey,
                score: team.score || 0,
                wins: team.wins || 0,
                losses: team.losses || 0,
                played: (team.wins || 0) + (team.losses || 0),
            },
            message: "Giriş Başarılı"
        });
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
}); 

router.post('/logout', (req,res) => {
    res.clearCookie('token',{
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        path : '/'
    }); 
    
    return res.status(200).json({message : "Başarıyla çıkış yapıldı"}); 
}); 

module.exports = router;