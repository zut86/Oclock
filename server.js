/************************************** */
/************************************** */
/* FICHIER D'INITIALISATION DU SERVEUR */
/************************************** */
/************************************** */





/************************************** */
            /* MODULES */
/************************************** */
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser'); 
const pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);


/************************************** */
            /* HELPERS */
/************************************** */
const pageHelper = require('./helper/page');
let initHelper = require('./helper/init');

/* vérification de la base de données */
initHelper.check(function(){
    /* libération de la mémoire du fichier init */
    delete require.cache[require.resolve("./helper/init")];


    /************************************** */
        /* INITIALISATION DU SERVER */
    /************************************** */
    const app = express();
    app.use(favicon(__dirname + '/public/favicon.ico'));

    app.set('views', path.join(__dirname, 'view'));
    app.set('view engine', 'pug');
    app.locals.basedir = path.join(__dirname, 'view');
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));



    /************************************** */
            /* GESTION DE SESSION */
    /************************************** */
    const dataHelper = require('./helper/data');
    const dbUser = dataHelper.getLogin();
    const dbName = dataHelper.getDBName();
    const pgPool = new pg.Pool({
        user: dbUser.login,
        host: 'localhost',
        database: dbName,
        password: dbUser.password,
        port: 5432
    });

    const d = new Date();
    const n = d.getMilliseconds();
    app.use(session({	
        name: 'oclock'+n,
        secret: 'game'+n,
        resave: true,
        cookie: { sameSite:true,maxAge:1200000,httpOnly:true },
        saveUninitialized: true,
        store: new pgSession({
            pool : pgPool,
            tableName : 'user'
        })
    }));


    
    /************************************** */
            /* ATTRIBUTION DU PORT */
    /************************************** */
    const port = process.env['PORT'] || 80;
    app.listen(port);



    /************************************** */
        /* GESTION DES REQUETES/REPONSES */
    /************************************** */
    app.use(function(req,res,next){
        pageHelper.get(req,function(response){
            switch(response.status){
                case 0:
                    /* envoi de données */
                    res.json(response.data);
                break;
                case 1:
                    /* affichage de la page */
                    res.render(response.view,response.data);
                break;
                case 2:
                    /* redirection vers la homepage */
                    res.writeHead(301,
                        {Location: '/'}
                    );
                    res.end();
                break;
                case 404:
                    /* page inconnue (erreur 404) */
                    res.status(404).render("404");
                break;
            }
        });
    });
});