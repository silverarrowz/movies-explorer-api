const router = require('express').Router();
const { validateMovieCreate, validateMovieDelete } = require('../middlewares/validation');
const { getUserMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/', getUserMovies);
router.post('/', validateMovieCreate, createMovie);
router.delete('/:_id', validateMovieDelete, deleteMovie);

module.exports = router;