Lors d’une mission, j’ai eu à développer une API permettant de retourner uniquement les champs demandés de façon dynamique.

Par exemple, si j’ai l’entité suivante :

```
{
  id
  firstName
  lastName
  age
}
```

L’API doit permettre à son client de lui demander de ne retourner qu’id et age, ou bien id, firstName et lastName.

Cette fonctionnalité permet de répondre à plusieurs problématiques :

* Réduire la volumétrie des requêtes ;
* Réduire le nombre de requêtes (la requête étant sur mesure, cela évite au client de faire plusieurs requêtes pour obtenir ce qu’il veut) ;

Après plusieurs recherches, j’ai découvert GraphQL dont je vais vous parler dans cette série de deux articles.

## GraphQL, qu’est-ce que c’est ?

GraphQL est un langage de requêtage développé par Facebook. Son objectif est de permettre au client de demander uniquement les champs qu’il souhaite lors d’un appel d’API. De plus, il fournit un système simple pour ajouter des paramètres à la requête.

GraphQL ne fait pas uniquement des requêtes GET, il fournit également un système de mutation pour créer ou modifier des entités en ne précisant là aussi que les champs que l’on souhaite.

GraphQL n’est pas lié à HTTP, mais cela reste la méthode la plus classique pour l’exposer. Il n’est pas non plus lié à une base de données spécifique, il peut être branché sur n’importe quelle source de données.

Ce premier article s’intéresse à la théorie sur GraphQL. Le prochain détaillera l’implémentation d’une API GraphQL.

## Les Queries

Les queries sont exprimées dans un pseudo langage où les champs demandés sont fournis dans un format propre à GraphQL.

Voici un exemple d’une query :

```
{
  humans {
    id
    name
    height
  }
}
```

Ici, on demande la liste des humains et on souhaite récupérer son identifiant, son nom et sa taille.

La réponse de GraphQL est la suivante :

``` json
{
  "data": {
    "humans": [
      {
        "id": "1",
        "name": "Luke Skywalker",
        "height": 1.72
      },
      {
        "id": "2",
        "name": "Obiwan Kenobi",
        "height": 1.75
      }
    ]
  }
}
```

Le JSON de retour contient un nœud « data » dans lequel est envoyé le résultat de la query. Le résultat de la query porte son nom (ici « humans »). Son contenu est sous la forme d’un tableau car cette query est de type liste. Chaque élément contient exactement les champs demandés précédemment.

### A savoir

Il est possible de faire plusieurs queries en une seule requête.

### Les arguments

Maintenant, si nous souhaitons obtenir plus d’information sur Luke Skywalker, nous pouvons faire la requête suivante avec l’argument ID :

Les arguments se placent dans les parenthèses et peuvent être de tout type. Ici « id » est de type Int.

```
{
  human(id: 1) {
    name
    height
    planet
    friends {
      name
    }
  }
}
```

Voici le résultat :

``` json
{
  "data": {
    "human": [
      {
        "name": "Luke Skywalker",
        "height": 1.72,
        "planet": "Tatooine",
        "friends": [
          {
            "name": "R2-D2",
          },
          {
            "name": "Hann Solo",
          }
        ]
      }
    ]
  }
}
```

## Les mutations

La mutation est l’opération GraphQL permettant de modifier une entité (rien à voir avec les X Men).

Une mutation s’écrit de la manière suivante :

```
mutation ($human: HumanInput!) {
  createHuman(human: $human) {
    id
    name
  }
}
```

Variables :

``` json
{
  "human": {
    "name": "Boba Fett"
  }
}
```

* $human est la variable human envoyée en paramètre ;
* HumanInput! est le type de la variable (« ! » signifie que le paramètre human est obligatoire) ;
* createHuman est le nom de la mutation ;
* { id name } sont les champs de l’objet human que l’API doit retourner après la création (cela fonctionne exactement comme les queries) ;

Voici le résultat :

``` json
{
  "data": {
    "createHuman": {
      "id": 5,
      "name": "Boba Fett"
    }
  }
}
```

## Gestion des erreurs

L’une des grandes forces de GraphQL est sa gestion des erreurs. Si vous faites une erreur de syntaxe dans votre query ou votre mutation, GraphQL va vous dire l’endroit de votre erreur, son type et une piste pour la corriger. C’est du luxe!

Voici un exemple :

```
{
  hero
}
```

Résultat :

``` json
{
  "errors": [
    {
      "message": "Field \"hero\" of type \"Character\" must have a selection of subfields. Did you mean \"hero { ... }\"?",
      "locations": [
        {
          "line": 3,
          "column": 3
        }
      ]
    }
  ]
}
```

## GraphiQL

GraphiQL est l’outil ultime pour consommer une API GraphQL. Il s’agit d’une interface graphique pour écrire ses queries et mutation. GraphiQL fait de l’introspection pour récupérer la documentation de votre API et propose de l’auto-complétion sur les champs.

Il est très simple à installer donc ne vous en privez pas !

graphiql.png

## Liens utiles :

* Documentation de GraphQL : https://graphql.org/
* GraphiQL : https://github.com/graphql/graphiql
* Liste des serveurs/clients GraphQL : https://graphql.org/code/

## Pour la suite

Comme je l’ai dit plus haut, mon prochain article détaillera l’implémentation d’une API GraphQL en .NET : [GraphQL + ASP.NET Core = ❤](./blog/graphql-aspnet-core)

A très bientôt !