package com.scm.security;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${scm.security.jwt.secret}") String secret,
            @Value("${scm.security.jwt.expiration-ms}") long expirationMs,
            @Value("${scm.security.jwt.issuer}") String issuer) {
        this.expirationMs = expirationMs;
        this.issuer = issuer;

        byte[] keyBytes = Base64.getDecoder().decode(
                Base64.getEncoder().encodeToString(secret.getBytes(StandardCharsets.UTF_8)));
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 32 characters");
        }
        this.signingKey = new SecretKeySpec(keyBytes, "HmacSHA256");
        log.info("JwtTokenProvider initialized with persistent HMAC-SHA256 key");
    }

    public String generate(String subject, List<String> roles) {
        return Jwts.builder()
            .issuer(issuer)
            .subject(subject)
            .claim("roles", roles)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(signingKey)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .requireIssuer(issuer)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }
}
