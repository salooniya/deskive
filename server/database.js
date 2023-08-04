import {Database} from 'core';

$.config( $.resolve(import.meta, './config.env') );

const DB = new Database('deskive');
const Desks = DB.collection('desks');
const Users = DB.collection('users');

$.deskive = {
    DB,
    Desks,
    Users
};
