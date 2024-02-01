const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6465756292:AAF3b5kfm9qOcXa53kZJ1hhocuZszv5jmAg';
const bot = new TelegramBot(token, {polling: true});
let ifItsJoined = false;
const userStates = new Map();
const channelUsername = '@chatterprotein';
const channelUsername2 = '@ProteinTeam';
const joined = ['عضو شدم', 'i joined', 'عضو شدم | i joined'];
let mainMenu = ['منو اصلی', 'main menu', 'منو اصلی | main menu'];
let guide = "متن مورد نظر خود را به هر زبانی که مسلط هستید به صورت صوتی بیان کنید | speak what you want to translate in any language you want"
let translator = ['ترجمه میکنم برات تو فقط بهم ویس بده به هر زبونی که میخوای و زبان مقصدت و انتخاب کن', 'translate with audio in any language', "ترجمه صوتی به صوتی | translate audio to audio"];
let userProfile = ['حساب کاربری شما📖✏️', 'your profile 📖✏️', 'حساب کاربری شما📖✏️ | your profile 📖✏'];
let aboutUs = ['درباره ما', 'about us', 'درباره ما | about us'];
let destinationLanguage = ['English', 'Spanish', 'Italian', 'German', 'Persian', 'Arabic', 'Chinese', 'Japanese', 'Korean', 'French', 'Russian', 'Turkey', 'Hindi'];
let continueTranslating = "ادامه ترجمه | continue translating"
let askToContinue = "آیا میخواهید ترجمه ادامه پیدا کند ؟ | do you want to continue translating "
let wrongOption = "لطفا گزینه مورد نظر خود را برای کار با ربات از داخل منو انتخاب کنید | please choose the right option in the menu";
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
let promoteUs = ["با معرفی ما به دوستان خود از ما حمایت کنید .", 'share our robot with your friend', 'با معرفی ما به دوستان خود از ما حمایت کنید | share us with your friend'];
let channelJoin = `لطفا ابتدا عضو کانال‌های ${channelUsername} و ${channelUsername2} شوید.`;
let changeTone = 'تغییر لحن متن👅 | 👅change tone of the text';
let changeTonerOption = ['متن نهایی که میخواهید فارسی است', 'The goal text is english'];
let changeTonerOptionPersian = ["عاشقانه", "رسمی", "داش مشتی", "ایمیلی", "ساده و خلاصه کن"];
let changeTonerOptionEnglish = ["Romantic", "Formal", "Slang", "Email Format", "Simplify and summarize"]
let whatTonePersian = "لحن متن شما به چه صورت باشد"
let whatToneEnglish = 'What should be the tone of your text?'
let askForChangeTheTone = "متن شما به چه زبانی است. | what's the language of your text";
let changeVoiceToText = 'ویسم را به متن تبدیل کن🗣📝 | 🗣📝Voice to text generator';

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
            isRequestingChangingToneEnglish: false,
            isCompletingProfile: false,
            isInvitingFriend: false,
            isChangingVoiceToText: false,
            lastText: "",
            preferLanguage: "",
            tone: "",
            textTone: ""
        };
        userStates.set(chatId, userState);
    }

    if (userState.isRequestingTranslate) {
        if (msg.voice) {
            console.log(userState.lastText);
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
                        let destLang = userState.lastText
                        formData.append('file', fs.createReadStream(tempFilePath));
                        formData.append('idChat', msg.chat.id.toString());
                        formData.append('destination', destLang + "");

                        // Send the file to your server
                        axios.post('http://localhost:3001/audioToAnyTest', formData, {
                            headers: formData.getHeaders()
                        })
                            .then((res) => {
                                console.log('File sent to server:', res.data.path);
                                // Remove the temporary file
                                fs.unlinkSync(tempFilePath);
                                const localFilePath = res.data.path + '/' + chatId + '.mp3'
                                console.log(chatId);
                                // Send the MP3 file as an audio message
                                // bot.sendAudio(chatId, localFilePath);
                                // bot.sendMessage(chatId, res.data.messages);
                                // bot.sendMessage(chatId, res.data.translate);
                                // bot.sendMessage(chatId, askToContinue, {
                                //     reply_markup: {
                                //         keyboard: [
                                //             [{text: continueTranslating}],
                                //             [{text: mainMenu[2]}],
                                //         ],
                                //         resize_keyboard: true,
                                //         one_time_keyboard: true
                                //     }
                                // });
                                bot.sendAudio(chatId, localFilePath)
                                    .then(() => {
                                        return bot.sendMessage(chatId, res.data.messages);
                                    })
                                    .then(() => {
                                        return bot.sendMessage(chatId, res.data.translate);
                                    })
                                    .then(() => {
                                        return bot.sendMessage(chatId, askToContinue, {
                                            reply_markup: {
                                                keyboard: [
                                                    [{text: continueTranslating}],
                                                    [{text: mainMenu[2]}],
                                                ],
                                                resize_keyboard: true,
                                                one_time_keyboard: true
                                            }
                                        });
                                    })
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
        userStates.set(chatId, {isRequestingTranslate: false, lastText: userState.lastText});
    } else if (userState.isChangingVoiceToText) {
        if (msg.voice) {
            console.log(userState.lastText);
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

                        // Send the file to your server
                        axios.post('http://localhost:3001/audioToTranscript', formData, {
                            headers: formData.getHeaders()
                        })
                            .then((res) => {
                                console.log(response.data);
                                bot.sendMessage(chatId, res.data.messages);
                                sendCustomMessage(bot, chatId);
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
        userStates.set(chatId, {isChangingVoiceToText: false});

    } else if (msg.voice) {
        await bot.sendMessage(chatId, wrongOption);
        await sendCustomMessage(bot, chatId);
    } else if (text === changeTonerOption[0]) {
        return bot.sendMessage(chatId, whatTonePersian, {
            reply_markup: {
                keyboard: [
                    [{text: changeTonerOptionPersian[0]}],
                    [{text: changeTonerOptionPersian[1]}],
                    [{text: changeTonerOptionPersian[2]}],
                    [{text: changeTonerOptionPersian[3]}],
                    [{text: changeTonerOptionPersian[4]}],
                    [{text: mainMenu[2]}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (text === changeTonerOption[1]) {
        return bot.sendMessage(chatId, whatToneEnglish, {
            reply_markup: {
                keyboard: [
                    [{text: changeTonerOptionEnglish[0]}],
                    [{text: changeTonerOptionEnglish[1]}],
                    [{text: changeTonerOptionEnglish[2]}],
                    [{text: changeTonerOptionEnglish[3]}],
                    [{text: changeTonerOptionEnglish[4]}],
                    [{text: mainMenu[2]}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        // changeTonerOptionEnglish
    } else if (userState.isRequestingChangingTone) {
        console.log("MIAD ?");
        // changeTone
        let object = {
            text: text,
            tone: userState.tone,
            idChat: msg.chat.id.toString()
        }
        // Send the file to your server
        axios.post('http://localhost:3001/changeTone', object)
            .then((res) => {
                console.log(res.data);
                bot.sendMessage(chatId, res.data.messages);
                sendCustomMessage(bot, chatId);
            })
            .catch((error) => {
                console.error('Error sending data to server:', error);
            });
        await userStates.set(chatId, {isRequestingChangingTone: false, tone: ""});
    } else if (userState.isRequestingChangingToneEnglish) {
        console.log("MIAD ?");
        // changeTone
        let object = {
            text: text,
            tone: userState.tone,
            idChat: msg.chat.id.toString()
        }
        // Send the file to your server
        axios.post('http://localhost:3001/changeToneEnglish', object)
            .then((res) => {
                console.log(res.data);
                bot.sendMessage(chatId, res.data.messages);
                sendCustomMessage(bot, chatId);
            })
            .catch((error) => {
                console.error('Error sending data to server:', error);
            });
        await userStates.set(chatId, {isRequestingChangingTone: false, tone: ""});
    } else if (text === changeTonerOptionPersian[0] || text === changeTonerOptionPersian[1] || text === changeTonerOptionPersian[2] || text === changeTonerOptionPersian[3] || text === changeTonerOptionPersian[4]) {
        console.log("in to miaeeee");
        await userStates.set(chatId, {isRequestingChangingTone: true, tone: text});
        userState.isRequestingChangingTone = true;
        await console.log(userState.isRequestingChangingTone);
    } else if (text === changeTonerOptionEnglish[0] || text === changeTonerOptionEnglish[1] || text === changeTonerOptionEnglish[2] || text === changeTonerOptionEnglish[3] || text === changeTonerOptionEnglish[4]) {
        console.log("in to miaeeee English");
        await userStates.set(chatId, {isRequestingChangingToneEnglish: true, tone: text});
        userState.isRequestingChangingToneEnglish = true;
        await console.log(userState.isRequestingChangingToneEnglish);
    } else if (text === changeVoiceToText) {
        userStates.set(chatId, {isChangingVoiceToText: true});
    } else if (text === continueTranslating) {
        await bot.sendMessage(chatId, guide);
        userStates.set(chatId, {isRequestingTranslate: true, lastText: userState.lastText});
    } else if (text.startsWith('/start')) {
        console.log("this is id " + msg.from.id);
        console.log(msg.text);

        const args = msg.text.split(' '); // Splits the message into parts
        if (args.length > 1) {
            const referralId = args[1]; // The second part is the referral ID
            // Handle the referral logic here
            console.log(`User ${username || name} was referred by ${referralId}`);
            try {
                await axios.post('http://localhost:3001/invite', {
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
                await axios.post('http://localhost:3001/start', {
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
                        [{text: joined[2]}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            console.log("is it in else ?");
            try {
                await axios.post('http://localhost:3001/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    textGeneratorChannel: true,
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
            isChangingVoiceToText: false,
            lastText: "",
            tone: "",
            textTone: ""
        });

    } else if (text === joined[2]) {
        console.log("this is id " + msg.from.id);
        // Check if the user is a member of the channel
        let isMember = await checkChannelMembership(chatId, msg.from.id);
        let isMember2 = await checkChannelMembership2(chatId, msg.from.id);
        if (isMember && isMember2) {

            try {
                await axios.post('http://localhost:3001/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    textGeneratorChannel: true,
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
                        [{text: joined[2]}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    }

    if (text === translator[2]) {
        console.log("its in here");
        await bot.sendMessage(chatId, promoteUs[2], {
            reply_markup: {
                keyboard: [
                    [{text: destinationLanguage[0]}],
                    [{text: destinationLanguage[1]}],
                    [{text: destinationLanguage[2]}],
                    [{text: destinationLanguage[3]}],
                    [{text: destinationLanguage[4]}],
                    [{text: destinationLanguage[5]}],
                    [{text: destinationLanguage[6]}],
                    [{text: destinationLanguage[7]}],
                    [{text: destinationLanguage[8]}],
                    [{text: destinationLanguage[9]}],
                    [{text: destinationLanguage[10]}],
                    [{text: destinationLanguage[11]}],
                    [{text: destinationLanguage[12]}],
                    [{text: mainMenu[2]}],
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        // userStates.set(chatId, {isRequestingTranslate: true});
    } else if (text === destinationLanguage[0] || text === destinationLanguage[1] || text === destinationLanguage[2] || text === destinationLanguage[3] || text === destinationLanguage[4] || text === destinationLanguage[1] || text === destinationLanguage[5] || text === destinationLanguage[6] || text === destinationLanguage[7] || text === destinationLanguage[8] || text === destinationLanguage[9] || text === destinationLanguage[10] || text === destinationLanguage[11] || text === destinationLanguage[12]) {
        await userStates.set(chatId, {isRequestingTranslate: true, lastText: text});
        console.log(userState);
        console.log('=================');
        console.log(text);
        await bot.sendMessage(chatId, guide, {
            reply_markup: {
                keyboard: [
                    [{text: mainMenu[2]}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (text === changeTone) {
        // askForChangeTheTone

        await bot.sendMessage(chatId, askForChangeTheTone, {
            reply_markup: {
                keyboard: [
                    [{text: changeTonerOption[0]}],
                    [{text: changeTonerOption[1]}],
                    [{text: mainMenu[2]}],
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });

    } else if (text === mainMenu[2]) {
        userStates.set(chatId, {
            ...userState,
            lastText: "",
            isRequestingTranslate: false,
            isChangingVoiceToText: false
        });
        await sendCustomMessage(bot, chatId);
    } else {
    }
});


bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    // Handle language selection
    if (data.startsWith('set_language_')) {
        const selectedLanguage = data.split('_')[2];
        let userState = userStates.get(chatId);
        if (selectedLanguage === 'english' || selectedLanguage === 'persian') {
            userState.preferLanguage = selectedLanguage;
            console.log(userState);
            bot.sendMessage(chatId, `Language set to ${selectedLanguage}. ${mainMenu[selectedLanguage === 'english' ? 1 : 0]}`);

        }
    }

    // Additional callback query handling if needed
});


async function sendCustomMessage(bot, chatId) {
    await bot.sendMessage(chatId, promoteUs[2], {
        reply_markup: {
            keyboard: [
                [{text: translator[2]}],
                [{text: changeVoiceToText}],
                [{text: changeTone}],
                [{text: userProfile[2]}],
                [{text: aboutUs[2]}]
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
