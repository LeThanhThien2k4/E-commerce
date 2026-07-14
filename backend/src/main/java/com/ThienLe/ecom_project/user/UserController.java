package com.ThienLe.ecom_project.user;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	@Autowired
	private UserService service;
	
	@GetMapping("csrf-token")
	public CsrfToken getCsrfToken(HttpServletRequest request) {
		return (CsrfToken) request.getAttribute("_csrf");
	}
	
	
	@GetMapping("users")
	public List<Users> getUsers(){
		return service.getUsers();
	}
	@PostMapping("users")
	public Users addUser(@RequestBody Users user) {
		return service.addUser(user);
	}
	
	@PostMapping("register")
	public Users register(@RequestBody Users user){
		return service.register(user);
	}
	
	@PostMapping("login")
	public String login(@RequestBody Users user){
		return service.verify(user);
	}
	
}