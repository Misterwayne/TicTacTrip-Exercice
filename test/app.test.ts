import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';


describe('API Tests', () => {
  let token: string;

  before(async () => {
    // Generate a valid token for testing
    const email = 'foo@bar.com';
    token = jwt.sign({ email }, SECRET_KEY);
  });

  describe('POST /api/token', () => {
    it('should return a token for a valid email', async () => {
      const response = await request(app)
        .post('/api/token')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.token).to.be.a('string');
    });

    it('should return an error for an invalid email format', async () => {
      const response = await request(app)
        .post('/api/token')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).to.equal('Invalid email format');
    });
  });

  describe('authenticateToken Middleware', () => {
    it('should return an error for missing token', async () => {
      const response = await request(app)
        .post('/api/justify')
        .set('Content-Type', 'text/plain')
        .send('Sample text');

      expect(response.status).to.equal(401);
      expect(response.body.error).to.equal('Unauthorized');
    });

  });

  describe('rateLimitMiddleware', () => {
    it('should return an error for exceeding word count limit', async () => {
      const longText = 'This is a long text with many words.'.repeat(2000); // Total word count: 80,000

    // Make multiple requests to increase the word count
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/justify')
        .set('Content-Type', 'text/plain')
        .set('Authorization', `Bearer ${token}`)
        .send(longText);
    }

    // Make one more request that should exceed the limit
    const response = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .set('Authorization', `Bearer ${token}`)
      .send(longText);

    // Assert the response status and error message
    expect(response.status).to.equal(402);
    expect(response.body.error).to.equal('Payment Required');
    })
    });

  describe('POST /api/justify', () => {
    it('should return justified text', async () => {
      const text = 'Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait;\
      je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier; il me semblait que j’étais moi-même ce dont parlait l’ouvrage:\
      une église, un quatuor, la rivalité de François Ier et de Charles-Quint.Cette croyance survivait pendant quelques secondes à mon réveil; elle ne choquait pas ma raison, mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n’était plus allumé.\
      Puis elle commençait à me devenir inintelligible, comme après la métempsycose les pensées d’une existence antérieure; le sujet du livre se détachait de moi, j’étais libre de m’y appliquer ou non; aussitôt je recouvrais la vue et j’étais bien étonné de trouver autour de moi une obscurité,\
      douce et reposante pour mes yeux, mais peut-être plus encore pour mon esprit, à qui elle apparaissait comme une chose sans cause, incompréhensible, comme une chose vraiment obscure. Je me demandais quelle heure il pouvait être; j’entendais le sifflement des trains qui, plus ou moins éloigné,\
      comme le chant d’un oiseau dans une forêt, relevant les distances, me décrivait l’étendue de la campagne déserte où le voyageur se hâte vers la station prochaine;\
      et le petit chemin qu’il suit va être gravé dans son souvenir par l’excitation qu’il doit à des lieux nouveaux, à des actes inaccoutumés, à la causerie récente et aux adieux sous la lampe étrangère qui le suivent encore dans le silence de la nuit, à la douceur prochaine du retour.';

      const response = await request(app)
        .post('/api/justify')
        .set('Authorization', `Bearer ${token}`)
        .send(text)
        .set('Content-Type', 'text/plain')
        .expect(200);

      expect(response.body).to.have.property('justifiedText');
      expect(response.body.justifiedText).to.be.a('string');

      // Verify justification to 80 characters
      const justifiedLines = response.body.justifiedText.split('\n');
      for (const line of justifiedLines) {
        expect(line.length).to.be.at.most(80);
      }
    });

    it('should return an error for an invalid Content-Type header', async () => {
      const response = await request(app)
        .post('/api/justify')
        .send({ text: 'Lorem ipsum dolor sit amet' })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.error).to.equal('Invalid Content-Type. Expected text/plain');
    });

  });
});
