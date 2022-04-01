package com.demo.gateway.filter;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.demo.gateway.model.User;
import com.demo.gateway.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import reactor.core.publisher.Mono;

@Component
public class MainFilter extends AbstractGatewayFilterFactory<MainFilter.Config> {

    @Autowired
    UserRepository userRepository;

    public MainFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!exchange.getRequest().getPath().toString().startsWith("/api/main/order")) {
                return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                }));
            }
            // Just extract jwt header when user order products
            List<String> headerAuthList = exchange.getRequest().getHeaders().getOrEmpty("Authorization");
            if (headerAuthList.isEmpty()) {
                return unauthorizedResponse(exchange);
            }
            String bearerToken = headerAuthList.get(0);
            if (!bearerToken.startsWith("Bearer ")) {
                return unauthorizedResponse(exchange);
            }
            final String token = bearerToken.substring(7, bearerToken.length());
            Claims claims = null;
            try {
                claims = Jwts.parser().setSigningKey(System.getenv("JWT_SHARED_SECRET")).parseClaimsJws(token).getBody();
            } catch (Exception e) {
                return unauthorizedResponse(exchange);
            }
            String username = claims.getSubject();
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (!userOptional.isPresent()) {
                return unauthorizedResponse(exchange);
            }
            exchange.getRequest().mutate().headers(headers -> {
                headers.add("X-Current-Logged-In-User", userOptional.get().getUsername());
            }).build();
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            }));
        };

    }

    public static class Config {
        // Put the configuration properties here
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }
}
