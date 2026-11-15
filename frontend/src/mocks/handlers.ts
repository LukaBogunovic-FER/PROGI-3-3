import {http, HttpResponse} from 'msw'


export const handlers = [
    http.get('/api/me', () => {
        return HttpResponse.json({
            id:1,
            name: 'Test User',
            email: 'test@example.com',
        })
    }),
]
