// import { NextResponse } from 'next/server'
// import { NextRequest } from 'next/server'
// import { verifyToken } from '@/utils/jwt'

// const publicRoutes = [
//   '/',
//   '/products',
//   '/product/(.*)',
//   '/categories',
//   '/search',
//   '/auth/login',
//   '/auth/signup',
//   '/auth/verify-otp',
//   '/api/auth/(.*)' // API for public routes
// ]

// const userRoutes = [
//   '/profile',
//   '/orders',
//   '/cart',
//   '/checkout',
//   '/wishlist',
//   '/dashboard/user/(.*)',
//   '/api/user/(.*)' // API for authenticated users
// ]

// const adminRoutes = [
//   '/admin/(.*)',
//   '/dashboard/admin/(.*)',
//   '/api/admin/(.*)' // API for admins
// ]

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname

//   const isPublicRoute = publicRoutes.some(route => new RegExp(`^${route}$`).test(path))
//   if (isPublicRoute) return NextResponse.next()

//   const token = request.cookies.get('token')

//   if (!token) {
//     const loginUrl = new URL('/auth/login', request.url)
//     loginUrl.searchParams.set('redirect', path)
//     return NextResponse.redirect(loginUrl)
//   }

//   try {
//     // Verify token and extract user details
//     const decoded = await verifyToken(token.value)
//     const userId = decoded.id
//     const userRole = decoded.role

//     // Check access permissions
//     if (adminRoutes.some(route => new RegExp(`^${route}$`).test(path)) && userRole !== 'admin') {
//       return new NextResponse('Unauthorized', { status: 403 })
//     }
//     if (userRoutes.some(route => new RegExp(`^${route}$`).test(path)) && !['user', 'admin'].includes(userRole)) {
//       return new NextResponse('Unauthorized', { status: 403 })
//     }

//     // Forward user ID in headers
//     const response = NextResponse.next()
//     response.headers.set('X-User-Id', userId)
//     response.headers.set('X-User-Role', userRole)
    
//     return response
//   } catch (error) {
//     console.error('Middleware error:', error)
//     const response = NextResponse.redirect(new URL('/auth/login', request.url))
//     response.cookies.delete('token')
//     return response
//   }
// }

// // Apply middleware to API & UI routes
// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//     '/api/:path*'
//   ]
// }

// testing middleware
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic middleware that just passes through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ]
}