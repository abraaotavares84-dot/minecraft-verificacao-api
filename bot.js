require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1445631030299197492";
const GUILD_ID = "1443498793084387370";
const API_URL = "https://roleplay-verificacao.onrender.com"; // URL do seu Koyeb

// Comando slash
const commands = [
  new SlashCommandBuilder()
    .setName("verificar")
    .setDescription("Verificar jogador no servidor.")
    .addStringOption(opt =>
      opt.setName("jogador")
         .setDescription("Nome do jogador")
         .setRequired(true)
    )
    .toJSON()
];

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

// Evento de login
bot.on("clientReady", () => {
  console.log(`Bot logado como ${bot.user.tag}`);
});

// Comando /verificar
bot.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "verificar") return;

  const jogador = interaction.options.getString("jogador").toLowerCase();

  try {
    await interaction.deferReply();

    await fetch(`${API_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: jogador })
    });

    await interaction.editReply(`Jogador **${jogador}** foi verificado!`);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("Erro ao conectar à API!");
    } else {
      await interaction.reply("Erro ao conectar à API!");
    }
  }
});

// Registro do comando slash
const rest = new REST({ version: "10" }).setToken(TOKEN);
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then(() => console.log("Comando registrado!"))
  .catch(console.error);

bot.login(TOKEN);
