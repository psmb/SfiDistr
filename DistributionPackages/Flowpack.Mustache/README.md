# Flowpack.Mustache

Opinionated Mustache templates.

## TL;DR

1. `composer require flowpack/mustache`
2. Inherit the Template object and set template variables as keys
```
prototype(Your.Site:Hello) < prototype(Flowpack.Mustache:Template) {
	planet = 'Earth'
}
```
3. Place a Mustache template into `Packages/Sites/Your.Site/Resources/Private/Fusion/Hello/Hello.html`. E.g. `Hello, {{planet}}`

4. Alternatively you can use it as an Eel helper, e.g. `@process.params = ${Mustache.render('Hello, {{planet}}', {planet: 'Earth'})}`. Useful for replacing some placeholders in content.

## TODO: object access
