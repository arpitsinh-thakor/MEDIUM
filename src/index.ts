import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

app.get('/', (c) => {
	return c.text('Hello World')
})

app.post('/api/v1/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl:c. env.DATABASE_URL,
	}).$extends(withAccelerate())

	const body = await c.req.json();
	try{
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
			}
		})

		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

		return c.json({user, jwt})
	}
	catch(e){
		return c.json({e})
	}
	finally{
		await prisma.$disconnect()
	}
	
})

app.post('/api/v1/signin',async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl:c. env.DATABASE_URL,
	}).$extends(withAccelerate())

	const body = await c.req.json();
	try{
		const user = await prisma.user.findUnique({
			where: {
				email: body.email,
				password: body.password,
			}
		})
		if(!user){
			return c.json({error: 'User not found'})
		}
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

		return c.json({jwt})
	}
	catch(e){
		return c.json({e})
	}
	finally{
		await prisma.$disconnect()
	}
})

app.get('/api/v1/blog/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {
	return c.text('blog post route')
})

app.put('/api/v1/blog', (c) => {
	return c.text('blog put route')
})

app.get('/api/v1/blog/bulk', (c) => {
	return c.text('blog bulk route')
})

export default app