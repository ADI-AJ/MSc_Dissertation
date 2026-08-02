const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CastMember = sequelize.define(
    "CastMember",
    {
        cast_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        cast_name: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: "cast_member",
        timestamps: false
    }
);

module.exports = CastMember;