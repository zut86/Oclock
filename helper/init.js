/************************************************ */
/************************************************ */
/* FICHIER D'INITIALISATION DE LA BASE DE DONNEES */
/************************************************ */
/************************************************ */

const dataHelper = require('./data');
const dbUser = dataHelper.getLogin();
const dbName = dataHelper.getDBName();

const { Pool } = require('pg');
const pool = new Pool({
    user: dbUser.login,
    host: 'localhost',
    database: 'postgres',
    password: dbUser.password,
    port: 5432
});

module.exports = {
    check:function(callback){
        /* Vérification de l'existence la base de données */
       checkDatabase(function(){
            var pool_oclock = new Pool({
                user: dbUser.login,
                host: 'localhost',
                database: dbName,
                password: dbUser.password,
                port: 5432
            });
            pool_oclock.connect((err, client, done)=>{
                /* Vérification de l'existence de la séquence poru incrémenter l'id des parties */
                checkSequences(client,()=>{
                    /* Vérification de l'existence des tables */
                    checkTables(client,()=>{
                        done();
                        callback();
                    });
                });
            });
        })
    }
};

/* VERIFICATION DE L'EXISTENCE DE LA BASE DE DONNEES */
function checkDatabase(callback){
    pool.connect((err, client, done)=>{
        client.query("select datname from pg_catalog.pg_database WHERE  lower(datname) ='"+dbName+"';",function(err,res){
            if(res.rows.length==0){
                /* CREATION  DE LA BASE DE DONNEES */
                client.query("CREATE DATABASE "+dbName+" WITH OWNER = "+dbUser.login+" ENCODING = 'UTF8' TABLESPACE = pg_default LC_COLLATE = '' LC_CTYPE = '' CONNECTION LIMIT = -1;", function(err) { 
                    done();
                    callback();
                });
            }
            else{
                done();
                callback();
            }
        });
    });
}

/* VERIFICATION DE L'EXISTENCE DES SEQUENCES */
function checkSequences(client,callback){
    let gameSequence = "create sequence if not exists game_id INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;ALTER SEQUENCE game_id OWNER TO "+dbUser.login+";";
    client.query(gameSequence,(err,res)=>{
        callback();
    });
}

/* VERIFICATION DE L'EXISTENCE DES TABLES */
function checkTables(client,callback){
    sessionTable(client,()=>{
        gameTable(client,()=>{
            card_positionTable(client,()=>{
                callback();
            });
        });
    })

}

/* CREATION DE LA TABLE POUR LES SESSIONS */
function sessionTable(client,callback){
    var isTableExist = "SELECT EXISTS (   SELECT FROM information_schema.tables    WHERE table_name   = 'user'   )";
    client.query(isTableExist,(err,res)=>{
        if(!res.rows[0].exists){
            var query = "CREATE TABLE \"user\" (	\"sid\" varchar NOT NULL COLLATE \"default\",	\"sess\" json NOT NULL,	\"expire\" timestamp(6) NOT NULL)	WITH (OIDS=FALSE);	ALTER TABLE \"user\" ADD CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE;	CREATE INDEX \"IDX_session_expire\" ON \"user\" (\"expire\");";
            client.query(query,(err,res)=>{
                console.log(err);
                callback();
            });
        }
        else{
            callback();
        }
    });
}

/* CREATION DE LA TABLE POUR LES PARTIES */
function gameTable(client,callback){
    var query = "CREATE TABLE IF NOT EXISTS game (id integer,date bigint,duration integer,timespent integer,status boolean,session TEXT,score integer, UNIQUE (id));";
    client.query(query,(err,res)=>{
        callback();
    });        
}

/* CREATION DE LA TABLE POUR LA POSITION DES CARTES */
function card_positionTable(client,callback){
    var query = "CREATE TABLE IF NOT EXISTS card (id integer,position integer,gameid integer,status boolean);";
    client.query(query,(err,res)=>{
        callback();
    });        
}