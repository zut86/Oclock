const { Pool } = require('pg');
const dbOwner = {login:"oclock",password:"test_01!"};
const dbName = "oclockdb";

const pool = new Pool({
  user: dbOwner.login,
  host: 'localhost',
  database: dbName,
  password: dbOwner.password,
  port: 5432
});

module.exports = {
    getLogin:function(){
        return dbOwner;
    },
    getDBName:function(){
        return dbName;
    },
    get:function(tableName,fields,query,order,callback){
        pool.connect((err, client, done) => {
            /* création de la requête */
            var querySQL="SELECT "+fields+" FROM "+tableName;
            if(query){
                querySQL+=" WHERE ";
                querySQL+=query;
            }

            if(order){
                querySQL+=order;
            }
            querySQL+=";";
            
            /* exécution de la requête */
            client.query(querySQL,(err,res)=>{
                if(err){
                    console.log(err);
                }
                done();
                callback(res);
            });
        });
    },
    insert:function(tableName,fields,values,returnValue,callback){
        pool.connect((err, client, done) => {
            /* création de la requête */
            var querySQL="INSERT INTO "+tableName+" "+fields+" VALUES "+values;
            
            if(returnValue){
                querySQL+=" RETURNING "+returnValue;
            }
            querySQL+=";";

            /* exécution de la requête */
            client.query(querySQL,(err,res)=>{
                if(err){
                    console.log("/***************************/");
                    console.log("INSERT ERROR");
                    console.log(querySQL);
                    console.log(err);
                    console.log("/***************************/");
                }
                done();
                if(returnValue){
                    callback(res.rows[0][returnValue]);
                }
                else{
                    callback();
                }
            });
        });
    },
    update:function(tableName,updatedFields,whereClause,returnValue,callback){
        pool.connect((err, client, done) => {
            var querySQL="UPDATE "+tableName+" SET "+updatedFields;
            if(whereClause){
                querySQL+=" WHERE "+whereClause;
            }
            if(returnValue){
                querySQL+=" RETURNING "+returnValue;
            }
            querySQL+=";";
            /* exécution de la requête */
            client.query(querySQL,(err,res)=>{
                if(err){
                    console.log("/***************************/");
                    console.log("UPDATE ERROR");
                    console.log(querySQL);
                    console.log(err);
                    console.log("/***************************/");
                }
                done();
                if(returnValue){
                    callback(res.rows[0][returnValue]);
                }
                else{
                    callback();
                }
            });
        });
    },
    delete:function(tableName,whereClause,callback){
        pool.connect((err, client, done) => {
            var querySQL="DELETE FROM "+tableName;
            if(whereClause){
                querySQL+=" WHERE "+whereClause;
            }
            querySQL+=";";
            client.query(querySQL,function(){
				done();
				callback();
            });
        });
    }
};