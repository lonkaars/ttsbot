var discordjs = require('discord.js'),
	googleTTS = require('google-tts-api'),
	fs = require("fs"),
	ttsReplace = require(__dirname + '/ttsreplace.json'),
	client = new discordjs.Client(),
	TOKEN = fs.readFileSync(__dirname + "/token").toString().trim(),

	// add your discord user id if you want access to the gain feature
	earrapers = ['318340982326427649'];

client.on('ready', () => {
	console.log("Klaar :tada:");
});


client.on('message', async message => {
	if (!message.content.trim().startsWith('tts ')) return;
	if (message.member.voice.channelID == null) return;

	// check for language args
	var msgarr = message.content.trim().split(' ');
	var volume = 1.2;
	var lang = 'nl';
	var snip = 0;
	if (msgarr[1].startsWith('-')) {
		snip += 1;
		lang = msgarr[1].match(/[A-z]+/g)[0];
	}
	if (msgarr[1].startsWith('%')) {
		snip += 1;
		if(earrapers.includes(message.author.id)) volume = Number(msgarr[1].match(/(\d+(\.\d+)?)/g)[0]);
	}

	// replace words for correct pronounciation
	msgarr = msgarr.slice(snip + 1);
	msgarr = msgarr.map(word => {
		// replace with ttsreplace.json
		if (ttsReplace.hasOwnProperty(lang) && ttsReplace[lang].hasOwnProperty(word.toLowerCase())) return ttsReplace[lang][word.toLowerCase()];

		// mentions
		var match = word.match(/<.*?(\d+)>/);
		if (match != null) return message.guild.members.resolve(match[1]).displayName;

		return word;
	})
	var msgtext = msgarr.join(' ');

	// get google tts url
	var url = await googleTTS(msgtext, lang, 1);
	var channel = message.member.voice.channel;
	var connection = await channel.join();
	var dispatcher = await connection.play(url, { volume, seek: 0, passes: 4, bitrate: 20000 });
	dispatcher.on('finish', async () => {
		dispatcher.destroy();
		channel.leave();
	});
});

client.login(TOKEN);
