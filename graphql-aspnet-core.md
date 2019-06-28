## Introduction

Dans mon [article précédent](./blog/graphql-exposez-vos-donnees-dynamiquement-dans-une-api-rest), je vous ai présenté GraphQL, le langage de requêtage de Facebook permettant de faire des requêtes sur mesure.

Maintenant, je vais vous montrer comment implémenter GraphQL sur une API ASP.NET Core avec [GraphQL for .NET](https://github.com/graphql-dotnet/graphql-dotnet).

## Les Queries

### Définition des types

#### Propriétés simples

Dans un premier temps, il nous faut décrire les types qu’expose notre API. Pour cela, GraphQL for dotnet utilise des ObjectGraphType. Il s’agit de types qui exposent un POCO pour GraphQL.

Si nous avons le POCO suivant :

``` csharp
public class Droid
{
    public string Id { get; set; }
    public string Name { get; set; }
}
```

Il nous faut créer l’ObjectGraphType correspondant :

``` csharp
public class DroidType : ObjectGraphType<Droid>
{
    public DroidType()
    {
        Name = "Droid";
        Description = "A mechanical creature in the Star Wars universe.";
        Field(d => d.Id).Description("The id of the droid.");
        Field(d => d.Name, nullable: true).Description("The name of the droid.");
    }
}
```

La propriété Name permet de nommer le type. Ce nom sera visible dans l’onglet Documentation Explorer de GraphiQL.

La propriété Description permet de donner une description au type ou au champ qui sera également visible dans le Documentation Explorer de GraphiQL. La description n’est pas obligatoire si le champ est autodescriptif.

#### Propriétés complexes

Ajoutons une nouvelle propriété a notre POCO :

``` csharp
public class Droid
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<Episode> AppearsIn { get; set; }
}
 
public class Episode
{
    public string Name { get; set; }
    public int Year { get; set; }
    public int Order { get; set; }
}
```

La propriété AppearsIn étant complexe, nous ne pouvons pas l’ajouter aussi simplement que précédemment en tant que field dans l’ObjectGraphType. Nous allons utiliser la surcharge prévue pour les types complexes :

``` csharp
public class DroidType : ObjectGraphType<Droid>
{
    public DroidType()
    {
        Name = "Droid";
        Description = "A mechanical creature in the Star Wars universe.";
        Field(d => d.Id).Description("The id of the droid.");
        Field(d => d.Name, nullable: true).Description("The name of the droid.");
        Field<ListGraphType<EpisodeType>>(
            "appearsIn",
            resolve: context => context.Source.AppearsIn);
    }
}
```

EpisodeType est l’ObjectGraphType du POCO Episode que je n’ai pas détaillé ici.

Il existe également FieldAsync qui permet de faire des traitements asynchrones dans le resolve.

### Définition des Queries

Maintenant que nous avons défini les types pour GraphQL, nous allons écrire les queries.

``` csharp
public class StarWarsQuery : ObjectGraphType<object>
{
    public StarWarsQuery(StarWarsData data)
    {
        Name = "Query";
        Field<DroidType>(
            "droid",
            arguments: new QueryArguments(
                new QueryArgument<NonNullGraphType<StringGraphType>>
                {
                    Name = "id",
                    Description = "id of the droid"
                }
            ),
            resolve: data.GetDroidByIdAsync(id);
        );
    }
}
```

### Définition du schéma

Maintenant que les types et les queries sont prêts, nous allons définir le schéma GraphQL :

``` csharp
public class StarWarsSchema : Schema
{
    public StarWarsSchema(IDependencyResolver resolver)
        : base(resolver)
    {
        Query = resolver.Resolve<StarWarsQuery>();
    }
}
```

Le schéma GraphQL contient deux propriétés :

* Query : classe de query que nous venons d’écrire
* Mutation : classe de mutation que nous ferons dans la seconde partie de cet article

### Injection de dépendances

Maintenant que nous avons développé toutes les classes nécessaires à GraphQL il ne faut pas oublier de les ajouter à l’injecteur de dépendances, sinon GraphQL ne pourra pas fonctionner.

``` csharp
service.AddTransiant<StarWarsData>();
service.AddTransiant<DroidType>();
service.AddTransiant<EpisodeType>();
service.AddTransiant<StarWarsQuery>();
service.AddSingleton(new StarWarsSchema(new FuncDependencyResolver(type => service.GetRequiredType(type))));
```

### Requêtage

Maintenant que tout est prêt, il ne nous reste plus qu’à appeler la query :

``` csharp
public class GraphQLService : IGraphQLService
{
    private readonly ISchema _query;
    public GraphQLService(ISchema query)
    {
        _query = query;
    }
    public async Task<ExecutionResult> ExecuteQueryAsync(string query)
        => await new DocumentExecuter()
            .ExecuteAsync(options =>
            {
                options.Schema = _query;
                options.Query = query;
            });
}
```

Il ne reste plus qu’à tester :

```
{
    droid(id: "AF669ABD-AAEB-4C7B-870D-0360FDFA02D5") {
        id
        name
        appearsIn {
            name
            year
            order
        }
    }
}
```

Le résultat :

``` json
{
    "data": {
        "droid": {
            "id": "AF669ABD-AAEB-4C7B-870D-0360FDFA02D5",
            "name": "R2-D2",
            "appearsIn": [
                {
                    "name": "Un nouvel espoir",
                    "year": 1977,
                    "order": 4
                },
                {
                    "name": "L'empire contre-attaque",
                    "year": 1980,
                    "order": 5
                },
                {
                    "name": "Le retour du Jedi",
                    "year": 1983,
                    "order": 6
                }
            ]
        }
    }
}
```

## Les Mutations

Pour rappel, la mutation est une action graphQL permettant de créer, modifier ou supprimer un objet.

### Input Type

En première partie de l’article, nous avons créé des ObjectGraphType qui nous permettaient de décrire les objets retournés par GraphQL. Ici nous allons créer des InputObjectGraphType. Comme leur nom permet de le deviner, ces types permettent de décrire les objets d’entrée de nos mutations. Voici un exemple avec le droïd :

``` csharp
public class DroidInputType : InputObjectGraphType
{
    public DroidInputType()
    {
        Name = "DroidInput";
        Field<NonNullGraphType<StringGraphType>>("name");
    }
}
```

On ne déclare que la propriété « Name » en non nul car l’identifiant sera autogénéré pour la couche de données.

### La mutation

``` csharp
public class StarWarsMutation : ObjectGraphType<object>
{
    public StarWarsMutation(StarWarsData data)
    {
        Name = "Mutation";
        Field<DroidType>(
            "createDroid",
            arguments: new QueryArguments(
                new QueryArgument<NonNullGraphType<DroidInputType>> {Name = "droid"}
            ),
            resolve: context =>
            {
                var droid = context.GetArgument<Droid>("droid");
                return data.AddDroid(droid);
            });
    }
}
```

Les mutations se déclarent de la même manière que les queries.

Le GraphType passé en paramètre de la méthode Field permet de définir le type de retour de la mutation.

Le type donné dans l’argument est l’InputType que nous avons créé juste avant.

La méthode GetArgument permet de récupérer notre input converti en POCO.

### Ajout de la mutation dans le schéma

Maintenant que la mutation est prête il faut l’ajouter au schéma GraphQL

``` csharp
public class StarWarsSchema : Schema
{
    public StarWarsSchema(IDependencyResolver resolver)
        : base(resolver)
    {
        Query = resolver.Resolve<StarWarsQuery>();
        Mutation = resolver.Resolve<StarWarsMutation>();
    }
}
```

### Requêtage

Une fois cette étape réalisée, il ne reste plus qu’à modifier notre GraphQLService pour qu’il puisse exécuter une mutation :

``` csharp
public class GraphQLService : IGraphQLService
{
    private readonly ISchema _query;
    public GraphQLService(ISchema query)
    {
        _query = query;
    }
    public async Task<ExecutionResult> ExecuteQueryAsync(string query)
        => await new DocumentExecuter()
            .ExecuteAsync(options =>
            {
                options.Schema = _query;
                options.Query = query;
            });
    public async Task<ExecutionResult> ExecuteMutationAsync(string query, string variables)
        => await new DocumentExecuter()
            .ExecuteAsync(options =>
            {
                options.Schema = _query;
                options.Query = query;
                options. Inputs = variables.ToInputs();
            });
}
```

Il ne reste plus qu’à tester :

```
{
    "query": "mutation ($droid: DroidInput!){ createDroid(droid: $droid) { id name } }",
    "variables": {
        "droid": {
            "name": "R2-D2"
        }
    }
}
```

Le résultat :

``` json
{
    "data": {
        "droid": {
            "id": "AF669ABD-AAEB-4C7B-870D-0360FDFA02D5",
            "name": "R2-D2"
        }
    }
}
```

## Conclusion

Il ne vous reste plus qu'a coder votre API GraphQL !

Happy coding 😉