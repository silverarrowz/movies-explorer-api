const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BadRequestError = require('../utils/errors/BadRequestError');
const NotFoundError = require('../utils/errors/NotFoundError');
const ConflictError = require('../utils/errors/ConflictError');

const User = require('../models/user');

const { NODE_ENV, SECRET_KEY } = process.env;

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => res.send({
        email: user.email,
        name: user.name,
        _id: user._id,
      }))
      .catch((err) => {
        if (err.name === 'CastError' || err.name === 'ValidationError') {
          return next(new BadRequestError('Переданы некорректные данные'));
        }
        if (err.code === 11000) {
          return next(new ConflictError('Данный email уже зарегистрирован'));
        }
        return next(err);
      }));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? SECRET_KEY : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => next(err));
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ name: user.name, email: user.email }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Передан некорректный идентификатор'));
      }
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ email, name });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Такой пользователь уже существует'));
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return (next);
    });
};