import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

userRouter.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl:c.env.DATABASE_URL,
	}).$extends(withAccelerate())

	const body = await c.req.json();
	try{
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
				name: body.name
			}
		})

		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

		return c.json({user, jwt})
	}
	catch(e){
		return c.json({e})
	}
})

userRouter.post('/signin',async (c) => {
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

		//check password
		if(user.password !== body.password){
			return c.json({error: 'Invalid password'})
		}
		
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

		return c.json({jwt})
	}
	catch(e){
		return c.json({e})
	}
})