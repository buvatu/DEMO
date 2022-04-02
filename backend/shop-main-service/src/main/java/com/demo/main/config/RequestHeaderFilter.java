package com.demo.main.config;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Little is known about this technique
        // Many devs are using SecurityContextHolder as a global carrier in app
        // But that means Spring Security will be in service app - and that is bad (Service app should not interfere with spring security)
        // I use RequestAttribute instead
        // To get data from RequestAttribute, please use RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST)
        request.setAttribute("currentLoggedInUser", request.getHeader("X-Current-Logged-In-User"));
        filterChain.doFilter(request, response);
    }

}
