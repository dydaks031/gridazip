const mysql = require('mysql');
const helper = require('./helper');

const defaultConnectionInfo = helper.getInfo('default');

const innerPool = mysql.createPool(defaultConnectionInfo);

const Pool = {
    getConnection: () => {
        return new Promise((resolve, reject) => {
            innerPool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(conn);
            });
        });
    }
};

module.exports = Pool;