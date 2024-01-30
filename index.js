const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6465756292:AAF3b5kfm9qOcXa53kZJ1hhocuZszv5jmAg';
const bot = new TelegramBot(token, {polling: true});
let ifItsJoined = false;
const userStates = new Map();
const channelUsername = '@chatterprotein';
const channelUsername2 = '@ProteinTeam';
const joined = ['عضو شدم', 'i joined'];
let mainMenu = ['منو اصلی', 'main menu'];
let translator = ['ترجمه میکنم برات تو فقط بهم ویس بده به هر زبونی که میخوای و زبان مقصدت و انتخاب کن', 'translate with audio in any language'];
let userProfile = ['حساب کاربری شما📖✏️', 'your profile 📖✏️'];
let aboutUs = ['درباره ما', 'about us'];
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
let promoteUs = ["با معرفی ما به دوستان خود از ما حمایت کنید .", 'share our robot with your friend'];
let channelJoin = `لطفا ابتدا عضو کانال‌های ${channelUsername} و ${channelUsername2} شوید.`;
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let name = msg.from.first_name + "";
    let surName = msg.from.last_name + "";
    let username = msg.from.username;
    let persian = "درود بر " + name;
    let english = "welcome " + name;
    let welcomeMessage = [persian, english];
    let userState = userStates.get(chatId);
    if (!userState) {
        userState = {
            isRequestingTranslate: false,
            isRequestingChangingTone: false,
            isCompletingProfile: false,
            isInvitingFriend: false,
            lastText: ""
        };
        userStates.set(chatId, userState);
    }


    if (userState.isRequestingTranslate) {
        if (msg.voice) {
            console.log("this is here its a voice");
            const fileId = msg.voice.file_id;
            bot.getFile(fileId).then(async (file) => {
                const filePath = file.file_path;
                const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

                try {
                    // Download the file from Telegram
                    const response = await axios({
                        method: 'get',
                        url: downloadUrl,
                        responseType: 'stream'
                    });

                    // Prepare the file path for saving
                    const tempFilePath = path.join(__dirname, 'tempfile.mp3');

                    // Save the file temporarily
                    response.data.pipe(fs.createWriteStream(tempFilePath)).on('finish', () => {
                        console.log('File downloaded.');

                        // Prepare form data
                        const formData = new FormData();
                        formData.append('file', fs.createReadStream(tempFilePath));
                        formData.append('idChat', msg.chat.id.toString());
                        formData.append('destination', 'English');

                        // Send the file to your server
                        axios.post('http://localhost:3000/audioToAnyTest', formData, {
                            headers: formData.getHeaders()
                        })
                            .then((res) => {
                                console.log('File sent to server:', res.data);
                                // Remove the temporary file
                                fs.unlinkSync(tempFilePath);
                                const localFilePath = '/Users/erfanesfahanian/Desktop/neural\ network/gpt4/my-gpt4-app/englishVoice/584379734.mp3'

                                // Send the MP3 file as an audio message
                                bot.sendAudio(chatId, localFilePath);
                            })
                            .catch((error) => {
                                console.error('Error sending file to server:', error);
                                // Remove the temporary file
                                fs.unlinkSync(tempFilePath);
                            });
                    });
                } catch (error) {
                    console.error('Error downloading file:', error);
                }
            });
        }
        userStates.set(chatId, {isRequestingTranslate: false});
    } else if (text.startsWith('/start')) {
        console.log("this is id " + msg.from.id);
        console.log(msg.text)

        const args = msg.text.split(' '); // Splits the message into parts
        if (args.length > 1) {
            const referralId = args[1]; // The second part is the referral ID
            // Handle the referral logic here
            console.log(`User ${username || name} was referred by ${referralId}`);
            try {
                await axios.post('http://localhost:3000/invite', {
                    idChatInvitePerson: referralId,
                    idChatGuest: msg.from.id
                });
                console.log("its in the try");
            } catch (error) {
                console.log("its in the error");
                console.error('Error sending data to server:', error);
            }
        }
        console.log("its before is member");
        let isMember = await checkChannelMembership(chatId, msg.from.id);
        let isMember2 = await checkChannelMembership2(chatId, msg.from.id);
        if (!(isMember && isMember2)) {
            console.log("should be here");
            try {
                await axios.post('http://localhost:3000/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    idChat: msg.from.id
                });
            } catch (error) {
                console.error('Error sending data to server:', error);
            }
            bot.sendMessage(chatId, channelJoin, {
                reply_markup: {
                    keyboard: [
                        [{text: joined[0]}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            console.log("is it in else ?");
            try {
                await axios.post('http://localhost:3000/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    logoChannel: true,
                    idChat: msg.from.id
                });
                await bot.sendMessage(chatId, welcomeMessage[0]);
            } catch (error) {
                console.error('Error sending data to server:', error);
                await bot.sendMessage(chatId, error);
            }
            await sendCustomMessage(bot, chatId);
        }
        userStates.set(chatId, {
            isRequestingTranslate: false,
            isRequestingChangingTone: false,
            isCompletingProfile: false,
            isInvitingFriend: false,
            lastText: ""
        });

    } else if (text === joined[0]) {
        console.log("this is id " + msg.from.id);
        // Check if the user is a member of the channel
        let isMember = await checkChannelMembership(chatId, msg.from.id);
        let isMember2 = await checkChannelMembership2(chatId, msg.from.id);
        if (isMember && isMember2) {

            try {
                await axios.post('http://localhost:3000/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    logoChannel: true,
                    idChat: msg.from.id
                });
                await bot.sendMessage(chatId, welcomeMessage[0]);
            } catch (error) {
                console.error('Error sending data to server:', error);
                await bot.sendMessage(chatId, error);
            }

            // await bot.sendMessage(chatId, welcomeMessage);
            await sendCustomMessage(bot, chatId);


        } else {
            bot.sendMessage(chatId, channelJoin, {
                reply_markup: {
                    keyboard: [
                        [{text: joined[0]}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    }

    if (text === translator[0]) {
        console.log("its in here");
        userStates.set(chatId, {isRequestingTranslate: true});
    } else if (text === mainMenu[0]) {
        userStates.set(chatId, {...userState, lastText: ""});
        await sendCustomMessage(bot, chatId);
    } else {
    }
});

async function sendCustomMessage(bot, chatId) {
    await bot.sendMessage(chatId, promoteUs[0], {
        reply_markup: {
            keyboard: [
                [{text: translator[0]}],
                [{text: userProfile[0]}],
                [{text: aboutUs[0]}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
}


async function checkChannelMembership(chatId, userId) {
    try {
        const member = await bot.getChatMember(channelUsername, userId);
        return member && (member.status === 'member' || member.status === 'administrator' || member.status === 'creator');
    } catch (error) {
        console.error('Error checking channel membership:', error);
        bot.sendMessage(chatId, 'خطا در بررسی عضویت کانال.');
        return false;
    }
}

async function checkChannelMembership2(chatId, userId) {
    try {
        const member = await bot.getChatMember(channelUsername2, userId);
        return member && (member.status === 'member' || member.status === 'administrator' || member.status === 'creator');
    } catch (error) {
        console.error('Error checking channel membership:', error);
        bot.sendMessage(chatId, 'خطا در بررسی عضویت کانال.');
        return false;
    }
}
