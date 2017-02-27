import multipipe from 'multipipe';
import makeSource from 'stream-json';
import ObjectStream from './object-stream';

export default options => {
  const source = makeSource(source);
  const objectStream = new ObjectStream(options);
  return multipipe(source.input, objectStream);
};
