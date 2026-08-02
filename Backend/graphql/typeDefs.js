const { gql } = require("graphql-tag");

module.exports = gql`

    type Movie {

        movie_id: Int

        original_title: String

        average_rating: Float

        status: String

        release_date: String

        revenue: String

        runtime: Int

        adult: String

        budget: String

        overview: String

        poster_path: String

    }

    type Genre {

        genre_id: Int

        genre_name: String

    }

    type Director {

        director_id: Int

        director_name: String

    }

    type CastMember {

        cast_id: Int

        cast_name: String

    }

    type FilterOptions {

        genres: [Genre]

        directors: [Director]

        cast: [CastMember]

    }

    input MovieFilterInput {

        genres: [Int]

        directors: [Int]

        cast: [Int]

    }

    type Query {

        hello: String

        filterOptions: FilterOptions

        movies(

            filters: MovieFilterInput

            limit: Int

            offset: Int

        ): [Movie]

    }

`;