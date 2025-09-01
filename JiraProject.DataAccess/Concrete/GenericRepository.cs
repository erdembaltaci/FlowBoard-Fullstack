// JiraProject.DataAccess/Concrete/GenericRepository.cs
using JiraProject.Business.Abstract;
using JiraProject.DataAccess.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly JiraProjectDbContext _context;
    private readonly DbSet<T> _dbSet;

    public GenericRepository(JiraProjectDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdWithIncludesAsync(int id, params string[] includeStrings)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includeStrings)
        {
            query = query.Include(include);
        }
        return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
    }

    public async Task<IEnumerable<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, params string[] includeStrings)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includeStrings)
        {
            query = query.Include(include);
        }
        return await query.Where(predicate).ToListAsync();
    }

    public async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.CountAsync(predicate);
    }

    // --- Diğer temel metotlar ---
    public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) => await _dbSet.Where(predicate).ToListAsync();
    public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
    public void Update(T entity) => _dbSet.Update(entity);
    public void Remove(T entity) => _dbSet.Remove(entity);
    public IQueryable<T> GetQueryableWithIncludes(params string[] includeStrings)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includeStrings) { query = query.Include(include); }
        return query;
    }
}