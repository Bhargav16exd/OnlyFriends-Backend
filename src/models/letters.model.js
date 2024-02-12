import mongoose  from "mongoose";
import crypto from 'crypto';    

const letterSchema = new mongoose.Schema({

    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        select:false
    },
    content:{
        type:String,
        required:true,
    },
    toBePublishedAt:{
       type:Date,
       required:true,
    },
    commentByRecipient:{
        type:String,
        default:"",
    }

},{timestamps: true});

letterSchema.pre('save', function(next) {
    const letter = this;

    
    if (!letter.isModified('content')) {
        return next();
    }

    
    const encryptedContent = encrypt(letter.content);
    letter.content = encryptedContent;
    next();
});


letterSchema.methods.decryptContent = function() {
    const letter = this;

    
    const decryptedContent = decrypt(letter.content);
    return decryptedContent;
};

const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const ENCRYPTION_IV = process.env.ENCRYPTION_IV; 

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ENCRYPTION_IV, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ENCRYPTION_IV, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


export const Letter = mongoose.model("Letter",letterSchema);
export {
    decrypt
}