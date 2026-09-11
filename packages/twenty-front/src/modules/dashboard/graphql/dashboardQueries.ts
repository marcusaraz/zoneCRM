import gql from 'graphql-tag';

// The API refuses two root fields of the same name in one document, so each
// number is asked for on its own. They are counts; the cost is in the asking,
// not the counting.
export const DASHBOARD_QUERIES = {
  people: gql`
    query ZoneDashboardPeopleCount($filter: PersonFilterInput) {
      people(filter: $filter) {
        totalCount
      }
    }
  `,
  companies: gql`
    query ZoneDashboardCompanyCount($filter: CompanyFilterInput) {
      companies(filter: $filter) {
        totalCount
      }
    }
  `,
  phoneCalls: gql`
    query ZoneDashboardCallCount($filter: PhoneCallFilterInput) {
      phoneCalls(filter: $filter) {
        totalCount
      }
    }
  `,
  notes: gql`
    query ZoneDashboardNoteCount($filter: NoteFilterInput) {
      notes(filter: $filter) {
        totalCount
      }
    }
  `,
};

export const DASHBOARD_RECENT_PEOPLE = gql`
  query ZoneDashboardRecentPeople($filter: PersonFilterInput) {
    people(filter: $filter, first: 8, orderBy: { updatedAt: DescNullsLast }) {
      edges {
        node {
          id
          slug
          updatedAt
          name {
            firstName
            lastName
          }
          company {
            name
          }
        }
      }
    }
  }
`;

export const DASHBOARD_CALLS_TO_RETURN = gql`
  query ZoneDashboardCallsToReturn($filter: PhoneCallFilterInput) {
    phoneCalls(
      filter: $filter
      first: 8
      orderBy: { occurredAt: DescNullsLast }
    ) {
      edges {
        node {
          id
          occurredAt
          phoneNumber
          person {
            id
            slug
            name {
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`;
