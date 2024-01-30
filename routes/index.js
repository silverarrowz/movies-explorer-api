const router = require('express').Router();
const auth = require('../middlewares/auth');

const { validateCreateUser, validateLogin } = require('../middlewares/validation');
const { createUser, login } = require('../controllers/users');

const userRouter = require('./users');
const movieRouter = require('./movies');

const NotFoundError = require('../errors/NotFoundError');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('/*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;