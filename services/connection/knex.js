const knex = require('knex');
const helper = require('./helper');

const defaultConnectionInfo = helper.getInfo('default');

const Knex = {
    getConnection: () => {
        var cursor = knex({
            client: 'mysql',
            connection: defaultConnectionInfo,
            pool: { min: 0, max: 10000 }
        });
        return new Promise((resolve, reject) => {
            resolve(cursor);
        }).catch(() => {
            throw new Error('knex connection error.');
        });
    }
};

module.exports = Knex;