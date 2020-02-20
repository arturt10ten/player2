const MongoClient = require("mongodb").MongoClient;

class DB {
    constructor(url) {
        this._url = url;
        this._open = 0;
        this._connection = null;
    }
    _connect() {
        this._open++;
        if (this._connection) return;
        this._connection = new Promise((res, rej) => {
            var mongoClient = new MongoClient(this._url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            mongoClient.connect(function(err, client) {
                if (err) rej(err);
                else res(client);
            });
        });
    }
    _disconnect() {
        this._open--;
        if (this._open) return;
        let closer = this._connection;
        this._connection = null;
        closer.then(i => i.close());
    }
    inseart(db_name, table_name, element) {
        return new Promise(async (res, rej) => {
            this._connect();
            const client = await this._connection;
            const db = client.db(db_name);
            const collection = db.collection(table_name);
            collection.insertOne(element, (err, dat) => {
                this._disconnect();
                if (err) rej(err);
                else res(dat);
            });
        });
    }
    query(db_name, table_name, query = {}, count, offset = 0) {
        return new Promise(async (res, rej) => {
            this._connect();
            const client = await this._connection;
            const db = client.db(db_name);
            const collection = db.collection(table_name);
            var i = collection.find(query).skip(offset);
            if (count) i = i.limit(count);
            i.toArray((err, result) => {
                this._disconnect();
                if (err) rej(err);
                else res(result);
            });
        });
    }
}
module.exports = { DB };
