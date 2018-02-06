const config = require('./config');

const Helper = {
    toDashedPhone: (phone) => {
        var value = String(phone).replace(/[^\d]/g, '');

        if (value.length >= 11) {
            return value.replace(/(\d{3})(\d{4})(\d)/, '$1-$2-$3');
        }
        else if(value.length >= 7) {
            return value.replace(/(\d{3})(\d{3})(\d)/, '$1-$2-$3');
        }
        else if (value.length >= 4) {
            return value.replace(/(\d{3})(\d+)/, '$1-$2');
        }
    }
};

module.exports = Helper;