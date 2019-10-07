const express = require("express");
const router = express.Router();
const Telegram = require("../models/telegram");
const User = require("../models/user");
const Usertotal = require("../models/user");
const Usersub = require("../models/user");
const Led = require("../models/led");
const Congregation = require("../models/congregation");
const bcrypt = require("bcryptjs");
const Escala = require("../models/escala");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const ms = require("ms");
const cron = require("node-cron");

var buttonConfirmation = [];
cron.schedule("0 */1 * * *", () => (buttonConfirmation = []));



const resetEmail1 = process.env.RESETEMAIL1;
const resetEmail2 = process.env.RESETEMAIL2;
const resetEmail3 = process.env.RESETEMAIL3;
const resetEmail4 = process.env.RESETEMAIL4;
const passreset = '123456';


if(process.env.MASTERTELEGRAM == null)process.env.MASTERTELEGRAM = '123'
if(process.env.TOKENTELEGRAM == null)process.env.TOKENTELEGRAM = "f"

const token = process.env.TOKENTELEGRAM;


const bot = new TelegramBot(token, { polling: true });

var socket = null;

bot.onText(/\/reset (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const email = match[1];
try{
  console.log("MENSAGEM",match);
  console.log("MEUDID:",chatId);
  console.log("EMAIL:",email);
  if(chatId == parseInt(resetEmail1) || chatId == parseInt(resetEmail2) || chatId == parseInt(resetEmail3)
  || chatId == parseInt(resetEmail4)){
  User.findOne({ email: email }, function(error, user) {
    if(error) return console.log("erro encontrado");
    if(!user) return console.log("usuario email não econtrado");

      user.password = bcrypt.hashSync(passreset, 10),
      user.save(function (err, result) {
          if (err) {
            return console.log("erro encontrado");
              }
              const resp = `Sucesso! Resetado email de *${user.firstName} *${user.lastName}`;
              bot.sendMessage(chatId, resp, { parse_mode: "Markdown" });
          })



})
  }
}catch(e){
console.log(e);
}

})


bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const startcode = match[1];

  console.log("startcode", startcode);

  Telegram.findOne({ code: startcode }, function(error, telegram) {
    if (error) return console.log(error);
    if (!telegram)
      return console.log("Codigo de cadastro de telegram nao encontrado!");

    User.findById(telegram.userId, function(error, user) {
      if (error) return console.log(error);
      if (!user) return console.log("Usuario nao encontrado!");

      let congName = " ";
      let circName = " ";
      Congregation.findById(user.congregation, function(error, congregation) {
        if (error) return console.log(error);
        if (!user) return console.log("Congregacao nao encontrada!");

        user.telegram = chatId;
        user.save();
        telegram.remove();

        congName = congregation.nome;
        circName = congregation.circuit;

        let pub = "irmão";
        if (user.sex == "M") pub == "irmã";
        const resp = `Tudo certo com seu cadastro ${pub} *${user.firstName} ${
          user.lastName
        }*! Você pertence a congregação *${congName}* do circuito *${circName}*. Agora você já pode receber suas designações pelo Telegram. Aguarde a próxima escala!`;
        try{
        bot.sendMessage(chatId, resp, { parse_mode: "Markdown" });
      } catch (e) {
        console.log(e);
      }
      });
    });
  });
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if(msg.text == '/totaltelegram'){


  User.findOne({ telegram: chatId }, function(error, user) {
    if(error) return console.log("erro encontrado");
    if(!user) {
      if (chatId == process.env.MASTERTELEGRAM){
//usuario alex adm
      }else{
      return console.log("usuario nao encontrado");
      }
    }

    Usertotal.find({telegram: {$ne: null}}).count(function(err, count) {
      if(err) return console.log("erro encontrado");
      console.log('Total com telegram ' + count  );
      try{
      bot.sendMessage(chatId, count);
    } catch (e) {
      console.log(e);
    }
      return console.log("ok total pedido 1");
});


 });

 return console.log("oktotal pedido");

  }

  console.log(msg);
  if (msg.new_chat_participant) {
    User.findOne({ telegram: msg.new_chat_participant.id }, (error, user) => {
      if (error) return console.log(error);
      if (!user) {
        bot.kickChatMember(chatId, msg.new_chat_participant.id, {
          until_date: Math.round((Date.now() + ms("1m")) / 1000)
        });
        return console.log(`Usuario ${userId} nao cadastrado no telegram`);
      }

      let resp = `Seja bem vinda *${user.firstName}*`;
      if (user.sex == "M") resp = `Seja bem vindo *${user.firstName}*`;
      try{
      bot.sendMessage(chatId, resp, { parse_mode: "Markdown" });
    } catch (e) {
      console.log(e);
    }
      bot.restrictChatMember(chatId, msg.new_chat_participant.id, {
        can_send_media_messages: false,
        can_send_messages: false
      });
    });
  }

  const start = "/start";

  if (
    !msg.text
      .toString()
      .toLowerCase()
      .includes(start) &&
    chatId != process.env.GROUPTELEGRAM
  ) {
    const respprivate = `Desculpe não entendi.`;
    try{
    bot.sendMessage(chatId, resp, { parse_mode: "Markdown" });
  } catch (e) {
    console.log(e);
  }
  }
});

bot.on("callback_query", msg => {
  let subdata_quest = msg.data.substring(0, 1);
  let index = msg.data.indexOf("%");
  let subdata_escalaid = msg.data.substring(1, index);
  let index2 = msg.data.indexOf("$");
  let subdata_userid = msg.data.substring(index + 1, index2);
  let subdata_codehora = msg.data.substring(index2 + 1);

  let atualData = new Date();
  if(buttonConfirmation.find(a => ((a.code == msg.data) && (atualData.getTime() - a.data.getTime() < 12000)))){
    //se existe cotninua o processo para o botão escolhido
  }else{
    let myresp = {
      code: msg.data,
      data: new Date()
    }
    buttonConfirmation.push(myresp);
    if (subdata_quest == "S")
    bot.answerCallbackQuery(msg.id, "Quer mesmo *confirmar*? Se sim, aperte novamente *confirmar*", true);
    if (subdata_quest == "N")
    bot.answerCallbackQuery(msg.id, "Quer mesmo *recusar*? Se sim, aperte novamente *recusar*", true);
    if (subdata_quest == "@")
    bot.answerCallbackQuery(msg.id, "Quer mesmo *substituir*? Se sim, aperte novamente *substituir*", true);
    return console.log(`primeira resposta armazenada: ${msg.data}`);
  }

  if (subdata_quest == "N") {
    setUserLed(
      subdata_escalaid,
      subdata_userid,
      subdata_codehora,
      false,
      true,
      msg,
      "Que pena, vamos tentar um substituto!"
    );
  }

  if (subdata_quest == "S") {
    setUserLed(
      subdata_escalaid,
      subdata_userid,
      subdata_codehora,
      true,
      false,
      msg,
      "Confirmado, obrigado!"
    );
  }

  if (subdata_quest == "@") {
    let index = msg.data.indexOf("%");
    let subdata_escalaid = msg.data.substring(1, index);
    let index2 = msg.data.indexOf("$");
    let subdata_userid = msg.data.substring(index + 1, index2);
    let subdata_codehora = msg.data.substring(index2 + 1);
    console.log("antes", subdata_escalaid, subdata_userid, subdata_codehora);
    setSubUser(
      subdata_escalaid,
      subdata_userid,
      subdata_codehora,
      msg.from.id,
      msg,
      true,
      true
    );
  }
});

bot.on("polling_error", error => {
  console.log(error.code);
});

router.post("/cadastro/:id", function(req, res, next) {
  User.findById(req.params.id, function(error, user) {
    if (error) return console.log(error);
    if (!user) return console.log("Usuario nao encontrado!");

    let rand = Math.floor(Math.random() * 65539990);
    let newcode = `${req.params.id}${rand}`;
    const newTelegram = new Telegram({
      code: newcode,
      userId: req.params.id
    });

    newTelegram.save();

    res.status(200).json({
      message: "Cadastro telegram preparado!",
      obj: newcode
    });
  });
});

router.post("/cadastro/grupo/:id", function(req, res, next) {
    res.status(200).json({
    link: process.env.LINKGRUPOTELEGRAM,
    nameBot: process.env.NAMEBOTTELEGRAM,
    });
  });

router.post("/:date", function(req, res, next) {
  const telegrams = [];

  Escala.find({ datainicio: req.params.date }, function(err, escala) {
    if (err) {
      return res.status(500).json({
        title: "Ocorreu um erro6",
        error: err
      });
    }

    if (!escala) {
      return res.status(500).json({
        title: "Não encontrou escala",
        error: err
      });
    }

    for (let i = 0; i < escala.length; i++) {
      for (let p = 0; p < escala[i].pontos.length; p++) {
        for (let u = 0; u < escala[i].pontos[p].length; u++) {
          for (let s = 0; s < escala[i].pontos[p][u].pubs.length; s++) {
            if (
              escala[i].pontos[p][u].pubs[s].userId &&
              escala[i].pontos[p][u].pubs[s].telegram
            ) {
              console.log(escala[i].pontos[p][u].pubs[s]);
              let userTelegram = escala[i].pontos[p][u].pubs[s].userId;
              let userFriend = [];
              let numberTelegram = escala[i].pontos[p][u].pubs[s].telegram;
              for (let z = 0; z < escala[i].pontos[p][u].pubs.length; z++) {
                if (userTelegram != escala[i].pontos[p][u].pubs[z].userId)
                  userFriend.push(escala[i].pontos[p][u].pubs[z]);
              }
              let userTarget = escala[i].pontos[p][u].pubs[s];
              let hora = escala[i].hora[p].hora;
              let dia = escala[i].dia;
              let diasemana = escala[i].diasemana;
              let ponto = escala[i].pontos[p][u].name;
              let message = `*Designação TPE*

Irmão: *${userTarget.firstName} ${userTarget.lastName}*
Dia: *${dia} ${diasemana}*
Hora: *${hora}*
Ponto: *${ponto}*
Companheiro: `;
              console.log("userfriend", userFriend);
              let complement = "";

              userFriend.map(j => {
                try{
                if(j.congregation.nome){
                complement =
                  complement +
                  `*${j.firstName} ${j.lastName}*
Tel: *${j.mobilephone}*
Cong: *${j.congregation.nome}*
Circ: *${j.congregation.circuit}*\n`;
                }
              }catch(e){
                console.log(e)
              }
              });

              let question = `\nPor favor confirmar sua designação no sistema do TPE`;
              message = message + complement + question;
              console.log("enviado", escala[i]);
              let textsim =
                "S" +
                escala[i]._id +
                "%" +
                userTarget.userId +
                "$" +
                escala[i].hora[p].code;
              let textnao =
                "N" +
                escala[i]._id +
                "%" +
                userTarget.userId +
                "$" +
                escala[i].hora[p].code;
              let user = {
                user: userTarget,
                dia: escala[i].dia,
                hora: escala[i].hora[p].hora
              };
              telegrams.push(user);
              console.log(numberTelegram, message);
              bot
                .sendMessage(numberTelegram, message, {
                  parse_mode: "Markdown",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "\u{2705} Confirmar",
                          callback_data: textsim
                        },
                        {
                          text: "\u{274C} Recusar",
                          callback_data: textnao
                        }
                      ]
                    ]
                  }
                })
                .then(m => {
                  Led.findOne(
                    {
                      idescala: escala[i]._id,
                      iduser: userTarget.userId,
                      horacode: escala[i].hora[p].code
                    },
                    function(err, led) {
                      if (err) {
                        return console.log(err);
                      }

                      if (!led) {
                        return console.log("Usuario inexistente");
                      }

                      led.msg = m;
                      led.save();
                      led
                        .save()
                        .then(() => {
                          console.log(
                            `sucesso ao salvar led msgid ${m.message_id}`
                          );
                        })
                        .catch(err => {
                          console.log(
                            `erro ao salvar led msgid ${m.message_id}`
                          );
                        });
                    }
                  ).catch(err => {
                    console.log(`Erro no disparo do telegram para o usuario`);
                  });
                });
            }
          }
        }
      }
    }

    res.status(200).json({
      message: "Telgrams enviados!",
      obj: telegrams
    });
  });
});

function setUserLed(idescala, iduser, horacode, sim, nao, msg, resposta, conjugeJarespondeu = false) {
  Led.findOne(
    {
      idescala: idescala,
      iduser: iduser,
      horacode: horacode
    },
    function(err, led) {
      if (err) {
        return console.log(err);
      }

      if (!led) {
        return console.log("Usuario inexistente");
      }

      if (led.sim || led.nao) {
        //Confirma a reposta do usuario
        bot.answerCallbackQuery(msg.id, "Respondido pelo site!", true);

        if (led.sim) {
          let text = msg.message.text + "\n\u{2705} *Confirmado*";
          bot.editMessageText(text, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id,
            parse_mode: "Markdown"
          });
        }

        if (led.nao) {
          let text = msg.message.text + "\n\u{274C} *Recusado*";
          bot.editMessageText(text, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id,
            parse_mode: "Markdown"
          });
        }

        return console.log("Usuario ja respondeu essa designacao");
      }

      led.sim = sim;
      led.nao = nao;

      led
        .save()
        .then(() => {
          console.log("led atualizado", led.iduser);

          atualiza_central_via_socket(
            idescala,
            iduser,
            horacode,
            sim,
            nao,
            "led",
            " "
          );

          //Confirma a reposta do usuario
          bot.answerCallbackQuery(msg.id, resposta, true);

          if (led.sim) {
            //Edita a mensagem do usuario
            let text = msg.message.text + "\n\u{2705} *Confirmado*";
            bot.editMessageText(text, {
              chat_id: msg.message.chat.id,
              message_id: msg.message.message_id,
              parse_mode: "Markdown"
            });

            return console.log("Fim respsim ok Led atualizado");
          }

          if (led.nao) {
            //Edita a mensagem do usuario
            let text = msg.message.text + "\n\u{274C} *Recusado*";
            bot.editMessageText(text, {
              chat_id: msg.message.chat.id,
              message_id: msg.message.message_id,
              parse_mode: "Markdown"
            });

            Escala.findById(idescala, function(err, escala) {
              console.log("li", escala);

              if (err) {
                return console.log("erro1", err);
              }

              if (!escala) {
                return console.log("erro1", err);
              }

              for (let p = 0; p < escala.pontos.length; p++) {
                for (let u = 0; u < escala.pontos[p].length; u++) {
                  for (let s = 0; s < escala.pontos[p][u].npubs; s++) {
                    if (
                      escala.pontos[p][u].pubs[s].userId == iduser &&
                      escala.hora[p].code == horacode
                    ) {
                      let irmao = `${escala.pontos[p][u].pubs[s].firstName} ${
                        escala.pontos[p][u].pubs[s].lastName
                      }`;

                      let userFriend = [];
                      for (
                        let z = 0;
                        z < escala.pontos[p][u].pubs.length;
                        z++
                      ) {
                        if (iduser != escala.pontos[p][u].pubs[z].userId){
                          userFriend.push(escala.pontos[p][u].pubs[z]);
                          if(!conjugeJarespondeu){
                          if(escala.pontos[p][u].pubs[s].conjuge){
                          setTimeout(() => {
                            setUserLed(idescala, escala.pontos[p][u].pubs[z].userId, horacode, sim, nao, msg, resposta, true); 
                          }, 1000);
                           
                        }
                      }
                      }
                      }

                      let text = `*Substituição TPE*
\nSubstituir: *${irmao}*
Dia: *${escala.dia} ${escala.diasemana}*
Hora: *${escala.hora[p].hora}*
Ponto: *${escala.pontos[p][u].name}*
Companheiro: `;

                      let complement = "";
                      let parceiroid = "";

                      userFriend.map(j => {
                        parceiroid = j.userId;

                        complement =
                          complement +
                          `*${j.firstName} ${j.lastName}*
Tel: *${j.mobilephone}*
Cong: *${j.congregation.nome}*
Circ: *${j.congregation.circuit}*\n`;
                      });

                      let question = `\nQuem gostaria de substituir?`;
                      text = text + complement + question;
                      let textsub =
                        "@" + idescala + "%" + iduser + "$" + horacode;

                      console.log("marca 4");
                      try {
                      bot.sendMessage(process.env.GROUPTELEGRAM, text, {
                        parse_mode: "Markdown",
                        reply_markup: {
                          inline_keyboard: [
                            [
                              {
                                text: "\u{1F504} Substituir",
                                callback_data: textsub
                              }
                            ]
                          ]
                        }
                      });
                    } catch (e) {
                      console.log(e);
                    }
                    }
                  }
                }
              }
            });
            return console.log("Fim respnao ok Led atualizado");
          }
        })
        .catch(err => {
          return console.log(err);
        });
    }
  );
}

function setSubUser(idescala, iduser, horacode, usergram, msg, sim, nao) {
  User.findOne({ telegram: usergram })
    .populate("congregation")
    .exec(function(err, user) {
      if (err) {
        return console.log("erro2", err);
      }

      if (!user) {
        return console.log("usersb não ecnontrado", err);
      }

      function getAge(dateString) {
        let today = new Date();
        console.log(today);
        let birthDate = new Date(dateString);
        console.log(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m == 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        console.log(age);
        return age;
      };

    /*   let data = moment.utc(user.datebirth).format("DD-MM-YYYY"); */
      let idade = getAge(user.datebirth);
      if(idade < 18){

        bot.answerCallbackQuery(
          msg.id,
          "Desculpe. Menores de idade não podem substituir",
          true
        );
        return console.log("Menor de idade");

      }



      Led.findOne(
        {
          idescala: idescala,
          iduser: user._id,
          horacode: horacode
        },
        function(err, led) {
          if (err) {
            return console.log(err);
          }

          if (led) {
            bot.answerCallbackQuery(
              msg.id,
              "Negado. Você já foi designado neste horário!",
              true
            );
            return console.log("Ja designado no horário");
          }

          Usersub.findById(iduser)
            .populate("congregation")
            .exec(function(err, usersub) {
              if (err) {
                return console.log("erro2", err);
              }

              if (!usersub) {
                return console.log("erro2", err);
              }

              console.log("Useriguais", usersub._id, user._id);
              if (usersub._id.equals(user._id) == true) {
                bot.answerCallbackQuery(
                  msg.id,
                  "Você não pode susbstituir você mesmo!",
                  true
                );
                return console.log("substituir você mesmo");
              }


              if (usersub.sex == "M" && user.sex == "M") {
                if (usersub.conjuge){

                bot.answerCallbackQuery(
                  msg.id,
                  "Desculpe, precisamos de uma irmã para este ponto!",
                  true
                );
                return console.log("erro de gênero");

                }
              }

              if (usersub.sex == "F" && user.sex == "M") {
                bot.answerCallbackQuery(
                  msg.id,
                  "Desculpe, precisamos de uma irmã para este ponto!",
                  true
                );
                return console.log("erro de gênero");
              }

              if (usersub.sex == "M" && user.sex == "F") {

                if (usersub.conjuge){

                }else{
                bot.answerCallbackQuery(
                  msg.id,
                  "Desculpe, precisamos de uma irmão para este ponto!",
                  true
                );
                return console.log("erro de gênero");
              }

              }

              Escala.findById(idescala, function(err, escala) {
                console.log("li", escala);

                if (err) {
                  return console.log("erro1", err);
                }

                if (!escala) {
                  return console.log("erro1", err);
                }

                for (let p = 0; p < escala.pontos.length; p++) {
                  for (let u = 0; u < escala.pontos[p].length; u++) {
                    for (let s = 0; s < escala.pontos[p][u].npubs; s++) {
                      if (
                        escala.pontos[p][u].pubs[s].userId == iduser &&
                        escala.hora[p].code == horacode
                      ) {
                        let obj = {
                          firstName: user.firstName,
                          lastName: user.lastName,
                          congregation: {
                            _id: user.congregation._id,
                            nome: user.congregation.nome,
                            circuit: user.congregation.circuit
                          },
                          circuito: user.circuito,
                          mobilephone: user.mobilephone,
                          phone: user.phone,
                          datebirth: user.datebirth,
                          responsable: user.responsable,
                          conjuge: user.conjuge,
                          sex: user.sex,
                          privilege: user.privilege,
                          email: user.email,
                          eldermail: user.eldermail,
                          config: user.config,
                          released: user.released,
                          userId: user._id,
                          lastday: user.lastday,
                          role: user.role,
                          agenda: user.agenda,
                          escala: user.escala,
                          telegram: user.telegram,

                          tipoesc: "S",
                          sim: sim,
                          nao: nao
                        };

                        Led.findOne(
                          {
                            idescala: idescala,
                            iduser: iduser,
                            horacode: horacode,
                            lock: false
                          },
                          function(err, led) {
                            if (err) {
                              return console.log(err);
                            }

                            if (!led) {
                              return console.log("Usuario inexistente");
                            }

                            if (!led.lock) {
                              let newled = new Led({
                                datainicio: led.datainicio,
                                datafim: led.datafim,
                                idescala: led.idescala,
                                iduser: user._id,
                                horacode: led.horacode,
                                indexpub: s,
                                sim: sim,
                                nao: false,
                                sub: {},
                                lock: false,
                                msg: led.msg,
                                data: led.data
                              });
                              led.sub = obj;
                              led.lock = true;
                              led
                                .save()
                                .then(() => {
                                  console.log("ok lock");
                                  newled
                                    .save()
                                    .then(() => {
                                      console.log("save newled");

                                      atualiza_central_via_socket(
                                        idescala,
                                        iduser,
                                        horacode,
                                        sim,
                                        nao,
                                        "sub",
                                        obj
                                      );

                                      user.escala.push(
                                        mongoose.Types.ObjectId(idescala)
                                      );
                                      user.save();

                                      usersub.escala.remove(idescala);
                                      usersub.markModified("escala");
                                      usersub.save();

                                      let text =
                                        msg.message.text +
                                        "\n\u{2705} *Confirmado por:* " +
                                        user.firstName +
                                        " " +
                                        user.lastName;
                                      bot.editMessageText(text, {
                                        chat_id: msg.message.chat.id,
                                        message_id: msg.message.message_id,
                                        parse_mode: "Markdown"
                                      });

                                      bot.answerCallbackQuery(
                                        msg.id,
                                        "Confirmado, obrigado por ajudar!",
                                        true
                                      );

                                      let mytime = setInterval(() => {
                                        bot.deleteMessage(
                                          msg.message.chat.id,
                                          msg.message.message_id
                                        );
                                        try{
                                        bot.sendMessage(usergram, text, {
                                          parse_mode: "Markdown"
                                        });
                                      } catch (e) {
                                        console.log(e);
                                      }
                                        clearInterval(mytime);
                                      }, 10000);
                                    })
                                    .catch(err => {
                                      console.log("erro", err);
                                    });
                                })
                                .catch(err => {
                                  // mongoose connection error will be handled here
                                  console.log("erro", err);
                                });
                            }
                          }
                        );
                      }
                    }
                  }
                }
              });
            });
        }
      );



      return console.log("SetSubUserOK");
    });
}

function atualiza_central_via_socket(
  idescala,
  iduser,
  horacode,
  sim,
  nao,
  mytype,
  myuser
) {
  socket.sockets.emit("grabEscala", {
    header: `Evento Socket emitido pelo servidor por ${iduser}`,
    idescala: idescala,
    iduser: iduser,
    horacode: horacode,
    sim: sim,
    nao: nao,
    type: mytype,
    user: myuser
  });
};



module.exports = router;
module.exports.bot = bot;
module.exports.pass = function(io) {
  socket = io;
};
