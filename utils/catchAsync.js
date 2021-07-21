// Return a function that
// Accepts a function
// Executes the function
// Catches any error and passes to next

module.exports = func => {
  return (req, res, next) => {
    func(req, res, next).catch(err => next(err));
  }
}