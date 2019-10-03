const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_cms_db');

const Page = conn.define('page', {
  id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
  },
  title: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      noEmpty: true
  }
});

Page.belongsTo(Page, {as: 'parent'});
Page.hasMany(Page, {foreignKey: 'parent'});


Page.findHomePage = function(){
  return this.findAll({ where: {parentId: null} }).filter(pages => pages.map(page => page.title).toString())
}

Page.prototype.findChildren = function(){
  return Page.findAll().filter(pages => {
    const current = pages.filter(page => this.id === page.parentId)
    current.map(child => child.title)
})
};


Page.prototype.hierarchy = function (){
 return Page.findAll().filter(pages => {
            const parent = pages.find(page => page.id === this.parentId);
            const result = [this.title, parent.title]
            const nextParent = pages.find(page => page.id === parent.parentId)
            result.push(nextParent.title)
            return result
            }
        )
    };


const mapAndSave = (pages) => Promise.all(pages.map(page => Page.create(page)));

const syncAndSeed = async() =>{
    await conn.sync({ force: true });

    const home = await Page.create({ title: 'Home Page' });

    let pages = [
        { title: 'About', parentId: home.id },
        { title: 'Contact', parentId: home.id }
    ];
    const [about, contact] = await mapAndSave(pages);

    pages = [
        { title: 'About Our Team', parentId: about.id },
        { title: 'About Our History', parentId: about.id },
        { title: 'Phone', parentId: contact.id },
        { title: 'Fax', parentId: contact.id }
    ];

    const [team, history, phone, fax] = await mapAndSave(pages);
    //find home page
    const homePage = await Page.findHomePage();
            console.log(homePage);
    //find children
    const homeChildren = await home.findChildren();
    console.log(homeChildren);
    //findFax
    const Fax = await Page.findOne({ where:{ title: 'Fax' } });
    console.log(Fax.get().title)
    //hierarch returns parent pages
    console.log(await fax.hierarchy())
}

module.exports = {
  syncAndSeed,
  models: {
      Page
  }
}
