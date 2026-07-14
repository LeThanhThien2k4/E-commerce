package com.ThienLe.ecom_project.user;

import com.ThienLe.ecom_project.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table(name = "users")
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Users {
	
    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String username;
	private String password;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.USER;
}
