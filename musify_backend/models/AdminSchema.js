const mangoose = require('mongoose');

const AdminSchema = mangoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true,
        private: true
    }
});

const AdminModel = mangoose.model('Admin', AdminSchema);

module.exports = AdminModel;