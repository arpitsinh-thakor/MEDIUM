import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt';


export const postRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables:{
        userId: string
    }
}>();

postRouter.use("/*", async (c, next) => {
    try{
        const authHeader = c.req.header('Authorization') || "";
        const user = await verify(authHeader, c.env.JWT_SECRET);

        if(!user){
            return c.json({error: 'Unauthorized user'})
        }
        else{
            c.set('userId', user.id);
            await next()
        }
        }
    catch(e){
        return c.json({error: 'Unauthorized catch'})
    }
})


postRouter.get('/get/:id',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id = c.req.param('id');
    try{
        const post = await prisma.post.findUnique({
            where: {
                id: id
            }
        })

        return c.json({post})
    }
    catch(e){
        return c.json({e})
    }
})

postRouter.post('/', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl:c.env.DATABASE_URL,
	}).$extends(withAccelerate())

    const body = await c.req.json();
    const userId = c.get('userId');
    try{
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId
            }
        })

        return c.json({post})
    }
    catch(e){
        return c.json({e})
    }
})

postRouter.put('/',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    try{
        const post = await prisma.post.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })

        return c.json({post})
    }
    catch(e){
        return c.json({e})
    }
})

postRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const posts = await prisma.post.findMany();

        return c.json({posts})
    }
    catch(e){
        return c.json({e, msg: 'Error fetching posts'})
    }
})