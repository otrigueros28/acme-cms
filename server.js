const express = require('express');
const app = express();
const db = require('./db')
const { Page } = db.models
const port = process.env.PORT || 3000;

app.get('/api/pages', (req, res, next) => {
    Page.findAll()
        .then(pages => res.send(pages))
        .catch(next)
})

app.get('/api/pages/:id/children', (req, res, next) => {
    Page.findChildren()
        .then(pages => {res.send(pages)})
        .catch(next)
})

app.get('/api/pages/:id/siblings', (req, res, next) => {
    Page.findAll()
        .then(pages => {
            const current = pages.find(page => page.id === req.params.id)
            const siblings = pages.filter(page => current.parentId === page.parentId && current.id !== page.id)
            res.send(siblings)
        })
        .catch(next);
})

db.syncAndSeed()
    .then(() => app.listen(port, () => console.log(`Listen on port ${port}`)))
