import getConnection from './database/mongo';

export default async function initialize() {
  await getConnection();
}
